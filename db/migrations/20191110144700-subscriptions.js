module.exports = {
  up: (queryInterface, DataTypes) =>
    queryInterface.createTable('Subscriptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      subscription: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, 
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

  down: queryInterface => queryInterface.dropTable('Subscriptions'),
};