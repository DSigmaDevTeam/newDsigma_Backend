const express = require('express');
const router = express.Router();

const branchController = require('../controllers/branchController')

router.post('/:companyId/registerbranch', branchController.register_post);

module.exports = router;
