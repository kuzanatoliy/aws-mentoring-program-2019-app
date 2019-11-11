const AWS = require('aws-sdk');

AWS.config.loadFromPath('./src/config/aws.access.config.json');

module.exports = AWS;
