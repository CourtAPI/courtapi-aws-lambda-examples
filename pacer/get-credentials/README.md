# AWS Lambda Example: Get Pacer Credentials

This example uses the CourtAPI JavaScript client library to get your PACER
credentials in CourtAPI.

## Event Payload

The Event Payload for this function needs your appId, and appSecret.

E.g.:

```javascript
{
  "appId": "your-app-id",
  "appSecret": "your-app-secret"
}
```

## Response

The response is the JSON response from CourtAPI
