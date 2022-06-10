const Sequelize = require("sequelize");
const sequelize = require("../../../../config/database");

const Shift = sequelize.define("shift", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      startTime:{
          type: Sequelize.STRING,
          allowNull: false
      },
      startDate:{
        type: Sequelize.STRING,
        allowNull: false
      },
      startImage:{
        type: Sequelize.STRING,
        allowNull: true
      },
      endTime:{
        type: Sequelize.STRING
      },
      endDate:{
        type: Sequelize.STRING
      },
      endImage:{
        type: Sequelize.STRING,
        allowNull: true
      },
      break:{
          type: Sequelize.ARRAY(Sequelize.JSON),
          allowNull: true
  
      },
      approved: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
      },
      status:{
        type: Sequelize.STRING,
        validate:{
          isIn:{
            args:[['Active', 'Completed', 'Unconfirmed', 'Approved']],
            msg: 'Inappropriate input'
          }
        }
      },
      totalBreak:{
        type: Sequelize.STRING,
        defaultValue: '00:00:00' 
      },
      totalShiftLength:{
        type: Sequelize.STRING,
        defaultValue: '00:00:00'
      },
      shiftWithoutBreak:{
        type: Sequelize.STRING,
        defaultValue: '00:00:00'
      }
  
    });
  
  module.exports = Shift;


