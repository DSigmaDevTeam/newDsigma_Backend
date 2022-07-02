const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');


// Middleware
// const emailAuth = require('../middleware/emailAuth');
const duplicateEmail = require('../middlewares/duplicateEmail');
const isAdmin = require('../middlewares/isAdmin');


router.post('/:companyId/:branchId/email',duplicateEmail, isAdmin ,emailController.email_post);




module.exports = router;