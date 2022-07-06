const Sequelize = require('sequelize');
require('dotenv').config();

// DB Connection  
// module.exports = new Sequelize('newDsigma', 
//     'postgres',
//     'password', {
//     host: 'localhost',
//     dialect: 'postgres',
//     // user: process.env.DATABASE_USERNAME,
//     operatorAliases: false,
//     logging: false,

//     pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     },
// });



module.exports = new Sequelize(
    process.env.DATABASE_URL,
    {
        logging: false,
        dialectOptions:{
            ssl:{
                required:true,
                rejectUnauthorized: false
            }
        }
    }
);