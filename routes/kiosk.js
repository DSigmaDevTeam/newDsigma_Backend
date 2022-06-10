const express = require('express');
const router = express.Router();
const kioskController = require('../controllers/kioskController');


// Middleware
const kioskLoginRequired = require('../middlewares/kioskLoginRequired');
const LoginRequired = require('../middlewares/loginRequired');


router.post('/login',kioskController.login_post);
router.get('/dashboard',kioskLoginRequired, kioskController.dashboard_get);
router.post('/:employeeId/login',kioskLoginRequired, kioskController.employeeLogin_post);
router.post('/startshift', LoginRequired, kioskController.employeeStartShift_post);
router.patch('/startbreak', LoginRequired, kioskController.employeeStartBreak_patch);
router.patch('/endbreak', LoginRequired, kioskController.employeeEndBreak_patch);
router.patch('/endShift', LoginRequired, kioskController.employeeEndShift_patch);



module.exports = router;