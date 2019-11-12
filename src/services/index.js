const awsServices = require('./aws');
const dataBaseServices = require('./database');

module.exports = {
  ...awsServices,
  ...dataBaseServices,
};
