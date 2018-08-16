# AWS Lambda Example: Save Pacer Credentials

This example uses the CourtAPI JavaScript client library to save your PACER
credentials in CourtAPI.

## Event Payload

The Event Payload for this function needs your appId, appSecret, pacerUser, and pacerPass

E.g.:

```javascript
{
  "appId": "your-app-id",
  "appSecret": "your-app-secret",
  "pacerUser": "your-pacer-username",
  "pacerPass": "you-pacer-password"
}
```

## Response

The response is the string `Pacer credentials stored successfully` on success,
or an error message on failure.
