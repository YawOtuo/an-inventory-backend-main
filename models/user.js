'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define the association to the "Shop" model
      User.belongsTo(models.Shop, {
        foreignKey: 'shopId', // Define the foreign key in the "User" table
        onDelete: 'CASCADE', // Optional: Define the onDelete behavior
      });
    }
  }

  User.init({
    username: DataTypes.STRING,
    uid : DataTypes.STRING,
    password: DataTypes.STRING, // Hashed password
    shopId: DataTypes.INTEGER, // Foreign key referencing the Shop model's id
    acceptedIntoShop: DataTypes.BOOLEAN,
    permission: DataTypes.STRING,
    email: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};
