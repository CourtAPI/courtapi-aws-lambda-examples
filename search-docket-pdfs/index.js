//
// AWS Lambda Function searchDocketPDFs()
//
// This updates a case docket sheet and searches for all docket entries
// matching your search criteria, buying all of the PDFs in the matching docket
// entries and returning a list of filenames and urls where the PDFs can be
// downloaded from.
//
'use strict';

const CourtApi = require('court_api');
const merge    = require('merge');
const auth     = require('./inc/auth');
const handlers = require('./inc/handlers');

//
// Helper to determine if an object is empty
//
function isEmptyObject(obj) {
  for (const item in obj)
    return false;

  return true;
}

//
// Get the Case Menu from CourtAPI
//
function getCaseMenu(court, caseNumber) {
  const caseApi = new CourtApi.CaseApi();

  return new Promise((resolve, reject) => {
    caseApi.getCaseMenu(court, caseNumber, handlers.promiseCallback(resolve, reject));
  });
}

//
// Import a case from PACER into CourtAPI
//
function pacerImportCase(court, caseNumber) {
  const pacerCaseApi = new CourtApi.PacerCaseLookupApi();

  const search = {
    caseNo: caseNumber
  };

  return new Promise((resolve, reject) => {
    pacerCaseApi.searchCourtCases(court, search, handlers.promiseCallback(resolve, reject));
  });
}

//
// Get the Case Menu from CourtAPI.  Imports from PACER if necessary
//
function getOrImportCase(court, caseNumber) {
  return new Promise(async (resolve, reject) => {
    var caseMenu;

    try {
      caseMenu = await getCaseMenu(court, caseNumber);
    }
    catch (e) {
      if (typeof e.error === 'string' && e.error.indexOf("No Matching Case") !== -1) {
        await pacerImportCase(court, caseNumber);
        caseMenu = await getCaseMenu(court, caseNumber);
      }
      else {
        return reject(e);
      }
    }

    resolve(caseMenu);
  });
}

//
// Update the case dockets in CourtAPI from PACER
//
function updateDockets(court, caseNumber) {
  const queryApi = new CourtApi.QueryApi();

  return new Promise((resolve, reject) => {
    queryApi.updateDockets(court, caseNumber, null, handlers.promiseCallback(resolve, reject));
  });
}

//
// Fetch a page of docket entries from CourtAPI
//
function getDocketPage(court, caseNumber, search, page) {
  const caseApi = new CourtApi.CaseApi();

  const options = merge(search, {
    pageNumber: page,
    pageSize: 50
  });

  return new Promise((resolve, reject) => {
    caseApi.getDockets(court, caseNumber, options, handlers.promiseCallback(resolve, reject));
  });
}

//
// List the documents for a docket entry
//
function listDocketDocuments(court, caseNumber, docketNumber) {
  const caseApi = new CourtApi.CaseApi();

  return new Promise((resolve, reject) => {
    caseApi.getDocketDocuments(court, caseNumber, docketNumber,
      handlers.promiseCallback(resolve, reject)
    );
  });
}

//
// Update the documents for a docket entry from PACER
//
function updateDocketDocuments(court, caseNumber, docketNumber) {
  const queryApi = new CourtApi.QueryApi();

  return new Promise((resolve, reject) => {
    queryApi.updateDocketDocuments(court, caseNumber, docketNumber,
      // We need to ignore the "No PDF Document" error, so we cant use
      // handlers.promiseHandler here
      (error, data, response) => {
        if (error) {
          // if there are no documents available for this entry, just return an empty docs list
          if (error.response.body.errorMessage && error.response.body.errorMessage.indexOf("No PDF") !== -1)
            return resolve({ parts: [] });
          else
            return reject(error.response.body);
        }
        else if (response.body.error)
          return reject(response.body.error);
        else
          return resolve(response.body);
      }
    );
  });
}

//
// Get the documents for a docket entry in CourtAPI, updating the documents
// from PACER if required
//
async function getDocketDocuments(court, caseNumber, docketNumber) {
  let response = await listDocketDocuments(court, caseNumber, docketNumber);

  // update the documents from PACER if necessary
  if (response.parts.length === 0)
    response = await updateDocketDocuments(court, caseNumber, docketNumber);

  return response;
}

//
// Get a document part from CourtAPI
//
function getDocumentPart(court, caseNumber, docketSeq, partNumber) {
  const caseApi = new CourtApi.CaseApi();

  return new Promise((resolve, reject) => {
    caseApi.getDocketDocument(court, caseNumber, docketSeq, partNumber,
      handlers.promiseCallback(resolve, reject)
    );
  });
}

//
// Import a document part into CourtAPI from PACER (by purchasing the document)
//
function importDocumentPart(court, caseNumber, docketSeq, partNumber) {
  const queryApi = new CourtApi.QueryApi();

  return new Promise((resolve, reject) => {
    queryApi.buyDocketDocument(court, caseNumber, docketSeq, partNumber,
      handlers.promiseHandler(resolve, reject)
    )
  });
}

//
// Get a document part from CourtAPI, buying the document part from PACER if
// necessary
//
async function processDocumentPart(court, caseNumber, docketSeq, partNumber) {
  const docPart = await getDocumentPart(court, caseNumber, docketSeq, partNumber);

  // purchase the document from PACER if necessary
  if (isEmptyObject(docPart.part))
    return await importDocumentPart(court, caseNumber, docketSeq, partNumber);
  else
    return docPart;
}

//
// Process a docket entry.  Returns array of {url: url, filename: filename} for
// all documents in the docket entry.
//
async function processDocketEntry(court, caseNumber, docketEntry) {
  const docketSeq = docketEntry.docket_seq;

  const documents = await getDocketDocuments(court, caseNumber, docketSeq);

  let files = [];

  for (const item of documents.parts) {
    const docPart = await processDocumentPart(court, caseNumber, docketSeq, item.number);

    files.push({ filename: docPart.part.friendly_name, url: docPart.part.download_url });
  }

  return files;
}

//
// Search through the docket entries, buying documents as needed for all
// matching docket entries
//
// Returns array of {url: url, filename: filename} for
// all documents in the docket entry.
//
async function findDocuments(court, caseNumber, search) {
  let page = 1;
  let totalPages = 0;
  let docs = [];

  do {
    const dockets = await getDocketPage(court, caseNumber, search, page);

    // update total pages if necessary
    if (totalPages === 0)
      totalPages = dockets.entries.total_pages;

    for (const entry of dockets.entries.content) {
      const docketDocs = await processDocketEntry(court, caseNumber, entry);
      docs = docs.concat(docketDocs);
    }

    page = page + 1;
  } while (page < totalPages);

  return docs;
}

function main(event) {
  return new Promise(async (resolve, reject) => {
    try {
      auth.init(event.appId, event.appSecret);

      const court      = event.court;
      const caseNumber = event.caseNumber;
      const search     = event.search;

      await getOrImportCase(court, caseNumber);

      await updateDockets(court, caseNumber);

      const documents = await findDocuments(court, caseNumber, search);

      resolve(documents);
    }
    catch (e) {
      reject(e);
    }
  });
}

exports.handler = (event, context, callback) => {
  //process.on('unhandledRejection', err => callback(err));

  if (!event.appId)      return callback("appId is required");
  if (!event.appSecret)  return callback("appSecret is required");
  if (!event.court)      return callback("court is required");
  if (!event.caseNumber) return callback("caseNumber is required");
  if (!event.search)     return callback("search is required");

  main(event)
    .then((json) => callback(null, json))
    .catch((e) => callback(e));
};
