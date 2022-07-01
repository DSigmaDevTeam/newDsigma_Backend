const express = require('express');
const router = express.Router();

const branchController = require('../controllers/branchController')
// const loginRequired = require('../middlewares/loginRequired');
const isAdmin = require('../middlewares/isAdmin');
router.post('/:companyId/registerbranch',isAdmin, branchController.register_post);

module.exports = router;
