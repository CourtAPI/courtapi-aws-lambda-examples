//
// Delete stored PACER credentials
//
// Event:
// {
//    "appId": "your-app-id",
//    "appSecret": "your-app-secret"
// }
//
const CourtApi = require('court_api');
const auth     = require('./inc/auth');
const handlers = require('./inc/handlers');

exports.handler =  (event, context, callback) => {
  // check for required values
  if (!event.appId)     return callback("appId is required");
  if (!event.appSecret) return callback("appSecret is required");

  auth.init(event.appId, event.appSecret);

  const pacerApi = new CourtApi.PacerCredentialsApi();

  pacerApi.deleteCredentials(
    function (error, data, response) {
      if (error)
        return handlers.errorHandler(error, callback);
      else
        callback(null, 'Pacer credentials deleted');
    }
  );
}
