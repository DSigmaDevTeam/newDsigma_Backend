const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../config/database');

const DsigmaUser = require('./dsigma/dsigmaUser');
const Company = require('./company/company');
const Branch = require('./company/branch/branch');
const Employee = require('./company/branch/employee/employee');
const EmployeeDetails = require('./company/branch/employee/employeeDetails');
const Flag = require('./company/branch/employee/flag');
const Shift = require('./company/branch/shift/shift');
const ShiftTimeline = require('./company/branch/shift/shiftTimeline');
const Role = require('./company/rolesAndPermissions/role');
const Module = require("./company/module");
const Permission = require("./company/rolesAndPermissions/permission");
const EmployeeRole = require("./company/rolesAndPermissions/employeeRole");
// const TryPrem = require("./company/rolesAndPermissions/tryPrem");
// const Dealer = require('./dealer');
// const Product = require('./product');
// const Cart = require('./cart');
// const ProdCart = require('./prodCart');
// const Template = require('./template');
// const Order = require('./order');
// const Shift = require('./shift');
// const permission = require('./permission');
// const ShiftTimeline = require('./shiftTimeline');

// Relationships:

// DsigmaUser & company
DsigmaUser.hasOne(Company);
Company.belongsTo(DsigmaUser);

// Company & Branch
Company.hasMany(Branch);
Branch.belongsTo(Company);

// Branch & Employee
Branch.hasMany(Employee);
Employee.belongsTo(Branch);

// Employee & EmployeeDetails
Employee.hasOne(EmployeeDetails);
EmployeeDetails.belongsTo(Employee);

// Employee & Flag
Employee.hasOne(Flag);
Flag.belongsTo(Employee)

// Employee & Shift
Employee.hasMany(Shift);
Shift.belongsTo(Employee);

// Shift & Timeline
Shift.hasMany(ShiftTimeline);
ShiftTimeline.belongsTo(Shift);

// Branch & Roles
Branch.hasMany(Role);
Role.belongsTo(Branch);

// Modules & Roles
// Role.belongsToMany(Module, { through: Permission });
// Module.belongsToMany(Role, { through: Permission });

// Employee & Roles
Employee.hasOne(EmployeeRole);
EmployeeRole.belongsTo(Employee);
Role.hasMany(EmployeeRole)

// // Prem Roles & Modules
// Role.hasMany(TryPrem);
// TryPrem.hasMany(Module);
// TryPrem.belongsTo(Role);

// Role.hasMany(EmployeeRole);
// Employee.belongsToMany(Role,{through: 'EmployeeRole'});
// Role.belongsToMany(Employee,{through: 'EmployeeRole'});
// Role.hasOne(Employee)
// Employee.hasOne(Role);
// Role.belongsTo(Employee);


// // User & Flags
// User.hasOne(Flag, {foreignKey: 'user_id'});
// Flag.belongsTo(User, {foreignKey:'id'});

// // User & Employees
// User.hasOne(Employee);
// Employee.belongsTo(User);

// // Dealer & Products
// Dealer.hasMany(Product);
// Product.belongsTo(Dealer);
// Product.hasMany(ProdCart);

// // User & Cart
// User.hasOne(Cart);
// Cart.belongsTo(User);
// // ProdCart.belongsTo(Cart);
// ProdCart.belongsTo(User);

// // User & Templates
// User.hasMany(Template);
// Template.belongsTo(User);

// // User & Order
// User.hasOne(Order);
// Order.belongsTo(User);

// // User & Shift
// User.hasMany(Shift);
// Shift.belongsTo(User);

// // Role & User
// User.hasOne(Role);
// // Role.hasMany(User);

// // Role & Module
// Role.belongsToMany(Module, { through: permission });
// Module.belongsToMany(Role, { through: permission });

// // Status & ShiftTimeline
// Shift.hasMany(ShiftTimeline);
// ShiftTimeline.belongsTo(Shift);


// // User.hasOne(UserRole);
// // ye nahi kr sakte
// // UserRole.hasMany(User);

// // Role.hasMany(UserRole);
// // UserRole.belongsTo(Role)



//  This will check for the errors in DB connection
 sequelize.authenticate()
 .then(()=>{
     console.log('connected to PostgreSQL DB on port 5432');
 })
 .catch(err=>{
    console.log(`Database Error ${err}`);
 });

 const db = {};
 db.Sequelize = Sequelize;
 db.sequelize = sequelize;


db.sequelize.sync({force: true})
.then(()=>{
   console.log("successfully Synced all the models");
})
.catch(err=>{
   console.log(`DB sync Error: ${err.message}`)
})

