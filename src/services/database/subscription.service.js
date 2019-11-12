const { modelList: { Subscription } } = require('../../models');

async function findOrCreate(email, subscription) {
  return Subscription.findOrCreate({
    where: { email, subscription },
    default: { email, subscription },
  });
}

async function getByEmail(email) {
  return Subscription.findOne({
    where: { email },
    attributes: [ 'subscription' ],
  });
}

async function remove(subscription) {
  return Subscription.destroy({ where: { subscription } });
}

module.exports = {
  findOrCreate,
  getByEmail,
  remove,
};
