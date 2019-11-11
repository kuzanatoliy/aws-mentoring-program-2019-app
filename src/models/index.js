const Sequelize = require('sequelize');

const { defineImageModel } = require('./image.model');
const { defineSubscriptionModel } = require('./subscription.model');
const operatorAliases = require('./operatorAliases');
const config = require('../config/database.config');

const connection = new Sequelize({ ...config.development, operatorAliases });
const modelList = {
  Image: defineImageModel(connection, Sequelize),
  Subscription: defineSubscriptionModel(connection, Sequelize),
}

module.exports = {
  connection,
  modelList
}
