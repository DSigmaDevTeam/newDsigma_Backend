const Sequelize = require("sequelize");
const sequelize = require("../../config/database");

// single user can have one role
const DsigmaUser = sequelize.define("dsigmaUser", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      isEmail: true,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    isAdmin: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    } 
  });
  
  module.exports = DsigmaUser;


