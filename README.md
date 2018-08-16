# CourtAPI AWS Lambda Examples

This directory contains a set of function implementations for AWS Lambda that
demonstrate how to build things with CourtAPI.

# Building and Deploying Examples

## Prerequisites

1. You need to have build the CourtApi javascript swagger client library.
2. In order to deploy using `make deploy` you need the AWS Command Line
   Interface so that you have the `aws` command available.  You need an
   `area69` profile in your `~/.aws/config` with access to the Area69
   `CrossAccountAdminAccess` role.
3. You need NodeJS v8.10 or later.
4. You need `yarn` for installing npm packages.  You can install yarn with:
   `npm install -g yarn`
5. You need `make`

## Deploying To AWS

The Makefiles contain rules to build a zip file dist for each example.  You can
either upload the zip file into AWS Lambda, telling it to use the Node 8.10 (or
later) runtime and set it up in the AWS Lambda console.  Or, you can simply use
the Makefile rules to deploy the functions to Area69 in Lambda.

For example, here is how you deploy the `savePacerCredentials` function:

```shell
  $ cd pacer/save-credentials
  $ make deploy
  ...
  {
      "FunctionName": "savePacerCredentials",
      "FunctionArn": "arn:aws:lambda:us-east-1:691092241560:function:savePacerCredentials",
      "Runtime": "nodejs8.10",
      "Role": "arn:aws:iam::691092241560:role/service-role/courtapi_examples",
      "Handler": "index.handler",
      ...
  }
```

If you want to instead upload the zip file to AWS manually, you can just build
a zip file instead:

```shell
  $ make dist
```

This creates save-pacer-credentials.zip which can be uploaded to AWS Lambda via
the web interface.

You can delete functions from lambda with `make undeploy` as well.  There is
also a `make redeploy` which just does an `undeploy` followed by a `deploy`
