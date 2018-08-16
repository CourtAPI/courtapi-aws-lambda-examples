//
// Handlers module for CourtAPI examples
//
module.exports = {
  errorHandler: (error, callback) => {
    callback(
      "ERROR: " + error.status + "\n" +
      JSON.stringify(error.response.body, null, 2)
    );
  },
  promiseCallback: (resolve, reject) => {
    return (error, data, response) => {
      if (error)
        return reject(error.response.body);
      else if (response.body.error)
        return reject(response.body.error);
      else
        return resolve(response.body);
    };
  }
};
