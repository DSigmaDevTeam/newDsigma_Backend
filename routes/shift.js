const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');


// Middleware
// const kioskLoginRequired = require('../middlewares/kioskLoginRequired');
const LoginRequired = require('../middlewares/loginRequired');
const isAdmin = require('../middlewares/isAdmin');
// const employeeAccess = require('../middlewares/RBAC/employeeAccess');
// const employee = require('../middlewares/RBAC/employeePermissions');

// Create Shift Shift {AUTH REQUIRED}
router.post('/employee/addshift/:empId',LoginRequired,isAdmin, shiftController.createShift_post);
//  Fetch all shifts with user details {AUTH REQUIRED}
router.post('/employees/shifts',LoginRequired, isAdmin, shiftController.shifts_post);
// Approve shift {AUTH REQUIRED}
router.patch('/employee/shiftapprove/:shiftId',LoginRequired,isAdmin, shiftController.approve_patch);
// Delete shift {AUTH REQUIRED}
router.delete('/employee/shiftdelete/:shiftId', LoginRequired, isAdmin, shiftController.shiftDelete_delete);
// Edit shift {AUTH REQUIRED}
router.patch('/employee/shiftedit/:shiftId', LoginRequired, isAdmin, shiftController.shiftEdit_patch);
// Single Shift
router.get('/employee/shift/:shiftId', LoginRequired, isAdmin, shiftController.shift_get);




// Add a break {AUTH REQUIRED}
// router.patch('/employee/addbreak/:shiftId', shiftController.addBreak_patch);
// // Login using Kiosk pin { Start shift & End Shift }
// router.post('/employee/kiosklogin', shiftController.kioskLogin_post);



module.exports = router;