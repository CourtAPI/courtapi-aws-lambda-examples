# AWS Lambda Example: Generate a Case Docket Sheet

This example generates a docket sheet for a case using CourtAPI.

## Event Payload

The Event Payload for this function needs your appId, appSecret, the court, and
caseNumber.

E.g.:

```javascript
{
  "appId": "your-app-id",
  "appSecret": "your-app-secret",
  "court": "orbtrain",
  "caseNumber": "6:14-bk-63619"
}
```

## Response

The response is JSON that contains a single key: `html` with the html page as
the content.  You can pipe the output through `extract-html.js` program in
`../tools` to get the HTML string.
