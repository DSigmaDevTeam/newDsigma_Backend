const express = require('express');
const router = express.Router();

const branchController = require('../controllers/branchController')
// const loginRequired = require('../middlewares/loginRequired');
const isAdmin = require('../middlewares/isAdmin');
const multer = require('multer');
const aws = require( 'aws-sdk' );
const multerS3 = require( 'multer-s3-v2' );
const path = require('path');


const s3 = new aws.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    Bucket: 'branchlogo'
});


  function checkFileType(file, cb) {
    console.log(file);
    const filetypes = /jpg|png|jpeg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
  
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Image only!");
    }
  }


  const upload = multer({
    storage:multerS3({
		s3: s3,
		bucket: 'branchlogo',
		// acl: 'public-read',
		key: function (req, file, cb) {
			cb( null, path.basename( file.originalname, path.extname( file.originalname ) ) + '-' + Date.now() + path.extname( file.originalname ) )
		}
	}),
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  });
  




router.post('/:companyId/registerbranch',isAdmin,upload.fields([
    {
      name: "branchLogo",
      maxCount: 1,
    }
  ]), branchController.register_post);
router.get('/branches', isAdmin, branchController.branches_get);
router.get('/branch', isAdmin, branchController.branch_get);
router.get('/branch/switch/:branchId', isAdmin, branchController.switchBranch_get);
router.get('/branch/updatedUser', isAdmin, branchController.fetchUserDetails_get);
router.patch('/branch/edit/:branchId', isAdmin, branchController.editBranch_patch);

module.exports = router;
