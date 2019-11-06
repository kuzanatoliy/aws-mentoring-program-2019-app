module.exports = {
  up: (queryInterface, DataTypes) =>
    queryInterface.createTable('Images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    }),

  down: queryInterface => queryInterface.dropTable('Images'),
};
