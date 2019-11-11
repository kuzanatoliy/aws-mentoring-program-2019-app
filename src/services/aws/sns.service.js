const AWS = require('./aws.config');
const config = require('../../config/aws.services.config');

const sns = new AWS.SNS({ apiVersion: config.snsApiVersion });

async function subscribe(email) {
  return sns.subscribe({
    Protocol: config.snsProtocol,
    TopicArn: config.snsTopicArn,
    Endpoint: email,
    ReturnSubscriptionArn: true,
  }).promise();
}

async function unsubscribe(subscription) {
  return sns.unsubscribe({
    SubscriptionArn: subscription,
  }).promise();
}

async function pushMessage(message) {
  return sns.publish({
    Subject: 'AwsMentoringProgram: new image',
    Message: message,
    TargetArn: config.snsTopicArn,
  }).promise();
}

module.exports = {
  subscribe,
  unsubscribe,
  pushMessage
};
