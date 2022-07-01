const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Middleware
const loginRequired = require('../middlewares/loginRequired');

// Employee Details Form
router.patch('/employee/detailsform',loginRequired,employeeController.form_post);
// All Employees
router.get('/employees', loginRequired,employeeController.employees_get);
// Update Employee
router.patch('/employee/update/:empId', loginRequired,employeeController.employee_patch);
// Get Employee
router.get('/employee/:empId', loginRequired,employeeController.employee_get);
// Delete Employee
router.delete('/employee/:empId', employeeController.employee_delete);
// Activate Employee
router.patch('/employee/activate/:empId', employeeController.activateEmployee_patch);
//Register Employee 
router.post('/employee/register', employeeController.register_post);

module.exports = router;