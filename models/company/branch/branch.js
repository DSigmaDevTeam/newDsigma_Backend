const Sequelize = require("sequelize");
const sequelize = require("../../../config/database");

const Branch = sequelize.define("branch", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description:{
        type: Sequelize.STRING,
        allowNull:true
    },
    // This is Unique
    code:{
      type:Sequelize.INTEGER,
      allowNull:false,
      unique: true
    },
    // This has to be unique 
    kioskId:{
      type:Sequelize.STRING,
      allowNull:false,
      unique:true
    }
    
  });
  
  module.exports = Branch;


