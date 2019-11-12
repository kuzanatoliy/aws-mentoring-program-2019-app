const { modelList: { Image } } = require('../../models');

async function getList() {
  return Image.findAll();
}

async function getByName(fileName) {
  return Image.findOne({
    where: { fileName },
    attributes: [ 'id', 'fileName' ],
  });
}

async function findOrCreate(fileName) {
  return Image.findOrCreate({
    where: { fileName },
    default: { fileName },
  });
}

module.exports = {
  findOrCreate,
  getByName,
  getList,
};
