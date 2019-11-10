const AWS = require('./aws.config');
const config = require('../../config/aws.services.config');

const s3 = new AWS.S3({ apiVersion: config.s3ApiVersion });

async function getObject(fileName) {
  return s3.getObject({
    Bucket: config.s3Bucket,
    Key: fileName,
  }).promise();
}

async function pushObject({ originalname, buffer, mimetype }) {
  return s3.upload({
    ACL: config.s3Acl,
    Bucket: config.s3Bucket,
    Key: originalname,
    Body: buffer,
    ContentType: mimetype,
  }).promise();
}

module.exports = {
  getObject,
  pushObject,
};
