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
    },

    shiftStatus:{
      type: Sequelize.STRING,
      validate:{
        isIn:{
          args:[['Working', 'Not Working', 'On Break']],
          msg: 'Please select appropriate option'
        }
      },
      default:"Not Working",
      allowNull: false,
    }
    // isBranchManager:{
    //   type: Sequelize.BOOLEAN,
    //   DefaultValue: false
    // }
  });
  
  module.exports = Employee;


