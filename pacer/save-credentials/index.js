//
// Save your PACER credentials
//
// Event:
// {
//   "appId":     "Your app id",
//   "appSecret": "Your secret",
//   "pacerUser": "pacer-username",
//   "pacerPass": "pacer-password"
// }
//
const CourtApi = require('court_api');
const auth     = require('./inc/auth');
const handlers = require('./inc/handlers');

exports.handler = (event, context, callback) => {

  // check event for required values
  if (!event.appId)     return callback("appId is required");
  if (!event.appSecret) return callback("appSecret is required");
  if (!event.pacerUser) return callback("pacerUser is required");
  if (!event.pacerPass) return callback("pacerPass is required");

  auth.init(event.appId, event.appSecret);

  const pacerApi = new CourtApi.PacerCredentialsApi();

  const credentials = {
    pacerUser: event.pacerUser,
    pacerPass: event.pacerPass
  };

  // Create / Update PACER credentials
  pacerApi.saveCredentials(credentials, (error, data, response) => {
    if (error)
      return handlers.errorHandler(error, callback);
    else
      callback(null, 'Pacer credentials stored successfully');
  });
}
