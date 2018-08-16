# AWS Lambda Example: Search for and Purcase Docket PDFs

This example updates a Case's docket entires, and searches through the dockets
based on search criteria in the event payload.  For all matching docket
entries, the documents are purchased from PACER if necessary, and returns a
list of urls and filenames for all matching documents.

## Event Payload

The Event Payload for this function needs your appId, appSecret, the court,
caseNumber, and search criteria.  The search criteria can be anything that the
CourtAPI `CaseApi.getDockets()` function recognizes

E.g.:

```javascript
{
  "appId": "your-app-id",
  "appSecret": "your-app-secret",
  "court": "orbtrain",
  "caseNumber": "6:14-bk-63619",
  "search": {
    "searchKeyword": "jrp"
  }
}
```

## Response

The response is JSON array that contains `{url,filename}` pairs.

E.g.:

```javascript
[
  {
    "filename": "Bankr.D.Or.TRAIN._6-14-bk-63619_3.00000.pdf",
    "url": "http://s3.amazonaws.com/inforuptcy-storage/..."
  },
  ...
]
```
