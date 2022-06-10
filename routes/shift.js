const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');


// Middleware
// const kioskLoginRequired = require('../middlewares/kioskLoginRequired');
const LoginRequired = require('../middlewares/loginRequired');

// Create Shift Shift {AUTH REQUIRED}
router.post('/employee/addshift/:empId', shiftController.createShift_post);
//  Fetch all shifts with user details {AUTH REQUIRED}
router.get('/employees/shifts', shiftController.shifts_get);
// Approve shift {AUTH REQUIRED}
router.patch('/employee/shiftapprove/:shiftId', shiftController.approve_patch);
// Delete shift {AUTH REQUIRED}
router.delete('/employee/shiftdelete/:shiftId', shiftController.shiftDelete_delete);
// Edit shift {AUTH REQUIRED}
router.patch('/employee/shiftedit/:shiftId', shiftController.shiftEdit_patch);
// Single Shift
router.get('/employee/shift/:shiftId', shiftController.shift_get);




// Add a break {AUTH REQUIRED}
// router.patch('/employee/addbreak/:shiftId', shiftController.addBreak_patch);
// // Login using Kiosk pin { Start shift & End Shift }
// router.post('/employee/kiosklogin', shiftController.kioskLogin_post);



module.exports = router;