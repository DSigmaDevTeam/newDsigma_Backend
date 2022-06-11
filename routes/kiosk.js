const express = require('express');
const router = express.Router();
const kioskController = require('../controllers/kioskController');


// Middleware
const kioskLoginRequired = require('../middlewares/kioskLoginRequired');
const LoginRequired = require('../middlewares/loginRequired');

// Kiosk Login
router.post('/login',kioskController.login_post);
// All Employees
router.get('/dashboard',kioskLoginRequired, kioskController.dashboard_get);
// Employee Login
router.post('/:employeeId/login',kioskLoginRequired, kioskController.employeeLogin_post);
// Start Shift
router.post('/startshift', LoginRequired, kioskController.employeeStartShift_post);
// Start Break
router.patch('/startbreak', LoginRequired, kioskController.employeeStartBreak_patch);
// End Break
router.patch('/endbreak', LoginRequired, kioskController.employeeEndBreak_patch);
// End Shift
router.patch('/endShift', LoginRequired, kioskController.employeeEndShift_patch);

// Single Employee
// router.get('/employee/:employeeId', LoginRequired, kioskController.singleEmployee_get);



module.exports = router;