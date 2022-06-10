const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// ----------------------------------LOGIN---------------
// DsigmaUser Login
router.post('/user/login', authController.DsUser_login_post);

// Employee Login
router.post('/employee/login', authController.emp_login_post);

module.exports = router;
