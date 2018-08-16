//
// Show your PACER credentials
//
// Event:
// {
//   "appId":     "Your app id",
//   "appSecret": "Your secret"
// }
//
const CourtApi = require('court_api');
const auth     = require('./inc/auth');
const handlers = require('./inc/handlers');

exports.handler = (event, context, callback) => {
  // check event for required values
  if (!event.appId)     return callback("appId is required");
  if (!event.appSecret) return callback("appSecret is required");

  auth.init(event.appId, event.appSecret);

  const pacerApi = new CourtApi.PacerCredentialsApi();

  // Create / Update PACER credentials
  pacerApi.getCredentials(
    function (error, data, response) {
      if (error)
        return handlers.errorHandler(error, callback);
      else
        callback(null, JSON.stringify(response.body, null, 2));
    }
  );
}
