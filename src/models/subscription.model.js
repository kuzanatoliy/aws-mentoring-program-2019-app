function defineSubscriptionModel(queryInterface, DataTypes) {
  return queryInterface.define('Subscription', {
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
  });
}

module.exports = {
  defineSubscriptionModel
}
