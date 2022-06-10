const Sequelize = require("sequelize");
const sequelize = require("../../../../config/database");


const Employee = sequelize.define("employee", {
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
      // allowNull: false,
    },
    pin: {
      type: Sequelize.INTEGER,
      // This has to be false
      allowNull: false,
      unique: true,
    },
    roleId:{
      type: Sequelize.INTEGER,
      allowNull: false
    }
    // isBranchManager:{
    //   type: Sequelize.BOOLEAN,
    //   DefaultValue: false
    // }
  });
  
  module.exports = Employee;


