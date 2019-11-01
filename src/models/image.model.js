function defineImageModel(queryInterface, DataTypes) {
  return queryInterface.define('Image', {
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
}

module.exports = {
  defineImageModel
}
