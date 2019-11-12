const AWS = require('./aws.config');
const config = require('../../config/aws.services.config');

const lambda = new AWS.Lambda({ apiVersion: config.lambdaApiVersion });

async function checkBucket() {
  return lambda.invoke({
    FunctionName: config.lambdaFunctionArn,
    Payload: JSON.stringify({ bucketName: config.s3Bucket }),
  }).promise();
}

module.exports = {
  checkBucket,
};
