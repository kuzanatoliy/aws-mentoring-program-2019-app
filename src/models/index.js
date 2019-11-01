const Sequelize = require('sequelize');

const { defineImageModel } = require('./image.model');
const operatorAliases = require('./operatorAliases');
const config = require('../config/database.config');

const connection = new Sequelize({ ...config.development, operatorAliases });
const modelList = {
  Image: defineImageModel(connection, Sequelize),
}

module.exports = {
  connection,
  modelList
}
