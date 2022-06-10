const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req,res,cb){
        cb(null, './files');
    },
    filename: function(req,file,cb){
        cb(null, new Date().toISOString().replace(/:/g, '-'))
    }
});

const filter = (req,file,cb)=>{
    if(file.mimetype === 'application/pdf'){
        // This means we are accepting the file, Keeping it null wont show us any errors
        cb(null, true);
    } else{
        // This means we are rejecting the file, keeping it null wont show us any errors
        cb(new Error('File type is unaccepted'), false)
    }
}

const upload = multer({
    storage: storage, 
    limits:{
        // we have to set the number in bytes and we have set it to 5mb
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: filter  
});

// Middleware
const loginRequired = require('../middlewares/loginRequired');

// login required
router.patch('/employee/detailsform',loginRequired,upload.array('files', 3),employeeController.form_post);
// login required
router.get('/employees', loginRequired,employeeController.employees_get);
// login required
router.patch('/employee/update/:empId', loginRequired,employeeController.employee_patch);
// login required
router.get('/employee/:empId', loginRequired,employeeController.employee_get);
// login required
router.delete('/employee/:empId', employeeController.employee_delete);
// login required
router.patch('/employee/activate/:empId', employeeController.activateEmployee_patch);
// 
router.post('/employee/register', employeeController.register_post);

module.exports = router;