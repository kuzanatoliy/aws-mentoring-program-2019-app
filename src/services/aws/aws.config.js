const AWS = require('aws-sdk');

AWS.config.loadFromPath('../config/aws.access.config.json');

module.exports = AWS;
