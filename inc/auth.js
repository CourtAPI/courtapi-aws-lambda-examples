//
// Authentication Helper for CourtAPI examples
//

var CourtApi = require('court_api');

module.exports = {
  init: (appId, appSecret) => {
    var auth = CourtApi.ApiClient.instance.authentications['www-authenticate'];
    auth.username = appId;
    auth.password = appSecret;
  }
};
