const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');


// Middleware
const isAdmin = require('../middlewares/isAdmin');

// Create Shift Shift 
router.post('/employee/addshift/:empId',isAdmin, shiftController.createShift_post);
//  Fetch all shifts with user details 
router.post('/employees/shifts', isAdmin, shiftController.shifts_post);
// Approve shift 
router.patch('/employee/shiftapprove/:shiftId',isAdmin, shiftController.approve_patch);
// Delete shift 
router.delete('/employee/shiftdelete/:shiftId', isAdmin, shiftController.shiftDelete_delete);
// Edit shift 
router.patch('/employee/shiftedit/:shiftId', isAdmin, shiftController.shiftEdit_patch);
// Single Shift
router.get('/employee/shift/:shiftId', isAdmin, shiftController.shift_get);





module.exports = router;