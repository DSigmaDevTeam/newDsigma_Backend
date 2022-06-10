const Sequelize = require("sequelize");
const sequelize = require("../../../../config/database");

const ShiftTimeline = sequelize.define("ShiftTimelineTimeline", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      userId:{
          type: Sequelize.INTEGER,
          allowNull: true
      },
      shiftId:{
        type: Sequelize.INTEGER,
        allowNull: false
      },
      message:{
        type: Sequelize.STRING,
        allowNull: false
      }
      
    });
  
  module.exports = ShiftTimeline;


