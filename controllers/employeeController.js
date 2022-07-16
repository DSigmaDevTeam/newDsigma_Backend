const EmployeeDetails = require("../models/company/branch/employee/employeeDetails");
const Role = require("../models/company/rolesAndPermissions/role");
const Flag = require("../models/company/branch/employee/flag");
const Employee = require("../models/company/branch/employee/employee");
const nodemailer = require('nodemailer');
const ou = require('../utils/output');
const bcrypt = require('bcrypt');
const {transporter} = require("../utils/transporter");
const EmployeeRole = require("../models/company/rolesAndPermissions/employeeRole");
const aws = require( 'aws-sdk' );
const multerS3 = require( 'multer-s3-v2' );
const multer = require('multer');
const path = require( 'path' );



// const CLIENT_ID = process.env.CLIENT_ID;
// const CLIENT_SECRET = process.env.CLIENT_SECRET;
// const REDIRECT_URI = process.env.REDIRECT_URI;
// const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
// const SENDER_EMAIL = process.env.SENDER_EMAIL;

// S3 Instance
const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  Bucket: 'dsigma-employee-files'
});

// Check File Type Function
function checkFileType( file, cb ){
  // console.log(file)
// Allowed ext
const filetypes = /pdf|doc|docx|txt|rtf|jpg|png/;
// Check ext
const extname = filetypes.test( path.extname( file.originalname ).toLowerCase());
// Check mime
const mimetype = filetypes.test( file.mimetype );
if( mimetype && extname ){
  return cb( null, true );
} else {
  cb( 'Error: pdf,doc,docx,txt,rtf,jpg,png Only!' );
}
}

// Upload Files Function
const uploadsBusinessGallery = multer({
storage: multerS3({
  s3: s3,
  bucket: 'dsigma-employee-files',
  // acl: 'public-read',
  key: function (req, file, cb) {
    cb( null, path.basename( file.originalname, path.extname( file.originalname ) ) + '-' + Date.now() + path.extname( file.originalname ) )
  }
}),
limits:{ fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
fileFilter: function( req, file, cb ){
  checkFileType( file, cb );
}
}).array( 'galleryImage', 3 );

//Employee Details Form (TESTED) (Only mail Not working)
exports.form_post = async(req,res)=>{   

  try {
    const user = await Employee.findOne({where:{
      email: req.user
    },
    include:{
      model: Flag,
      attributes: ['flag']
    }});

// if to check if the users flag is "Registered"
    if(user && user.flag.flag === "Registered"){
      
  //  Uploading files to aws s3 
      uploadsBusinessGallery( req, res, async ( error ) => {
        if( error ){
          console.log( 'errors', error );
        } else {
          // If File not found
          if( req.files === undefined ){
            console.log( 'Error: No File Selected!' );
          } else {
            // If Success
     
            let fileArray = req.files,
              fileLocation;
            var galleryImgLocationArray = [];
            for ( let i = 0; i < fileArray.length; i++ ) {
              fileLocation = fileArray[ i ].location;
              galleryImgLocationArray.push( fileLocation )
            }

      // Inserting EMP details
            await EmployeeDetails.update({
              userId: user.id,
      // Info
              title: req.body.title,
              fname: req.body.fname,
              lname: req.body.lname,
              workEmail: req.body.workEmail,
              personalEmail: user.email,
              mobNumber: req.body.mobNumber,
      // Personal Info
              DOB: req.body.DOB,
              maritalStatus: req.body.maritalStatus,
              gender: req.body.gender,
              medicareNumber: req.body.medicareNumber,
              driversLicense: req.body.driversLicense,
              passportNumber: req.body.passportNumber,
              address: req.body.address,
              address2: req.body.address2,
              city: req.body.city,
              state: req.body.state,
              postCode: req.body.postCode,
              Country: req.body.country,
      // Bank Details
              bankName:req.body.bankName,
              BSB: req.body.BSB,
              accountNumber: req.body.accountNumber,
      // TAX INFO
              taxFileNumber: req.body.taxFileNumber,
      // Working Rights
              workingRights: req.body.workingRights,
      // Primary Contact
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email: req.body.email,
              mobile: req.body.mobile,
              workPhone: req.body.workPhone,
              contactType: req.body.contactType,
      // Secondary Contact
              sfname: req.body.sfname,
              slname: req.body.slname,
              semail: req.body.semail,
              smobNo: req.body.smobNo,
              sworkNo: req.body.sworkNo,
              scontactType: req.body.scontactType,
              linkedIn: req.body.linkedIn,
      // Files
              file1: galleryImgLocationArray[0],
              file2: galleryImgLocationArray[1],
              file3: galleryImgLocationArray[2],
            },{where:{userId: user.id}});
      
      // Updating Flag
            await Flag.update({flag: 'Onboarding'}, {where:{user_id: user.id}});
      
      
          }
        }
      });
      // var file1 = null;
      // var file2 = null;
      // var file3 = null;
      // console.log("fileee Location",req.files[1])
      // if(req.files.length === 3){
      //   file1 = req.files[0].location;
      //   file2 = req.files[1].location;
      //   file3 = req.files[2].location;
      // }else if(req.files.length === 2){
      //   file1 = req.files[0].location;
      //   file2 = req.files[1].location;
      // }else if(req.files.length === 1){
      //   file1 = req.files[0].location;
      // }

// Inserting EMP details
        // console.log(galleryImgLocationArray[1]);
        // console.log("User Id is ", user.id)
        // console.log("file Location", file1)
//        await EmployeeDetails.update({
//         userId: user.id,
// // Info
//         title: req.body.title,
//         fname: req.body.fname,
//         lname: req.body.lname,
//         workEmail: req.body.workEmail,
//         personalEmail: user.email,
//         mobNumber: req.body.mobNumber,
// // Personal Info
//         DOB: req.body.DOB,
//         maritalStatus: req.body.maritalStatus,
//         gender: req.body.gender,
//         medicareNumber: req.body.medicareNumber,
//         driversLicense: req.body.driversLicense,
//         passportNumber: req.body.passportNumber,
//         address: req.body.address,
//         address2: req.body.address2,
//         city: req.body.city,
//         state: req.body.state,
//         postCode: req.body.postCode,
//         Country: req.body.country,
// // Bank Details
//         bankName:req.body.bankName,
//         BSB: req.body.BSB,
//         accountNumber: req.body.accountNumber,
// // TAX INFO
//         taxFileNumber: req.body.taxFileNumber,
// // Working Rights
//         workingRights: req.body.workingRights,
// // Primary Contact
//         firstName: req.body.firstName,
//         lastName: req.body.lastName,
//         email: req.body.email,
//         mobile: req.body.mobile,
//         workPhone: req.body.workPhone,
//         contactType: req.body.contactType,
// // Secondary Contact
//         sfname: req.body.sfname,
//         slname: req.body.slname,
//         semail: req.body.semail,
//         smobNo: req.body.smobNo,
//         sworkNo: req.body.sworkNo,
//         scontactType: req.body.scontactType,
//         linkedIn: req.body.linkedIn,
// // Files
//         file1: file1,
//         file2: file2,
//         file3: file3,
//       },{where:{userId: user.id}});

      // const emp = await Employee.update(req.body, {where:{userId: user.id}});  


// Updating Flag
      // await Flag.update({flag: 'Onboarding'}, {where:{user_id: user.id}});

// Email Data
      // console.log(req.body)
      const output = ou.onboardingOutput(req.body)

                        try {
                          let transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                              user: "dev.dsigma@gmail.com",
                              pass: "wisypdnzdhcvjngj",
                            },
                          });
                          
                          let mailOptions = {
                            from: 'dsigmatesting@gmail.com',
                            to: req.body.email,
                            subject: `Dashify: New Employee Invitation for ${req.body.email}`,
                            html: output,
                            // attachments: [
                            //   {
                            //     filename: `${name}.pdf`,
                            //     path: path.join(__dirname, `../../src/assets/books/${name}.pdf`),
                            //     contentType: 'application/pdf',
                            //   },
                            // ],
                          };
                          
                          transporter.sendMail(mailOptions, function (err, info) {
                            if (err) {
                             console.log(`Something went wrong while sending email: ${err}`)
                            } else {
                              console.log("Email sent successfully")
                            }
                          });
                        //   console.log(result)
                          return res.status(200).json({
                            success: true,
                            message: "Thank you for completing the form Your manager is notified and will contact you"
                          });
                          // return result;
                        } catch (error) {
                          console.log(`Error while sending Email: ${error}`);
                          return res.status(500).json({
                            success: false,
                            message: "Server Error",
                          });
                        }
    }else{
      return res.status(404).json({
        success: false,
        message: "Invalid user"
      });
    }


  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    })
  }
}


// All Employees (NOT Tested)
exports.employees_get = async(req,res)=>{
  try {
    // 
    // Fetching all employees
  const employees = await Employee.findAll({where:{banchId: req.currentBranchId},
    order:[['createdAt', 'DESC']],
    attributes: ['email','createdAt', 'id'],
    include: [
             {model: EmployeeDetails, attributes:['fname', 'lname', 'mobNumber', 'title']},
             {model:Flag, attributes:['flag']},

       ]
  });
    return res.status(200).json({
      success:true,
      employees: employees
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Server Error"
    })
  }

}


// Updating Employee (Tested)
exports.employee_patch = async(req,res)=>{
  try {
    // Checking if flag exists
      if(req.body.flag){
         await EmployeeDetails.update(req.body,{where:{employeeId: req.params.empId}});
         await Flag.update({flag:req.body.flag}, {where:{employeeId:req.params.empId}});
         return res.status(201).json({
           success: true,
           message: "Details updated successfully"
         });
      }

      await EmployeeDetails.update(req.body,{where:{employeeId: req.params.empId}});
      return res.status(201).json({
        success: true,
        message: "Details updated successfully"
      })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message:"Server Error"
    });
  }
}


// Deleting Employee (Tested)
exports.employee_delete = async(req,res)=>{
  try {
    // Destroying Employee
    const employee = await Employee.destroy({where: {id: req.params.empId},truncate:true});
    // Destroying Employee Details
    const employeeDetails = await EmployeeDetails.destroy({where: {employeeId: req.params.empId},truncate:true});
    // Destroying employee Flag
    const U = await Flag.destroy({where: {employeeId: req.params.empId}, truncate:true});
    return res.json({
      d: employee,
      flag: U
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success:false,
      message: error.message
    })
  }
}


// Fetching Single Employee (Tested)
exports.employee_get = async(req,res)=>{
  try {
    let result = {};
// fetching employee 
    const employee = await Employee.findOne({where:{id:req.params.empId}, 
    attributes: ['id', 'pin'],
    include: [
             {model: EmployeeDetails,attributes:{exclude:['id', 'userId', 'createdAt', 'updatedAt']}},
             {model:Flag, attributes:['flag']},

       ]});
      //  console.log(employee.employeeDetail)
// Rearranging
       result['user_id'] = employee.id;
       result['flag'] = employee.flag.flag;
       result['pin'] = employee.pin;
       const emp = employee.toJSON();
       const len = Object.keys(emp.employeeDetail).length;
       for (let i = 0; i < len; i++) {
         result[Object.keys(emp.employeeDetail)[i]] = Object.values(emp.employeeDetail)[i]
         
       }

       return res.status(200).json({
      success: true,
      employee: result
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({success: false, message: "Server Error"});
  }
}


// Activating Employee (Tested)
exports.activateEmployee_patch = async (req, res)=>{
  try {
    // Fetching flag & employee
    const check = await Flag.findOne({where:{employeeId: req.params.empId}, include:[{model: Employee}]});

    if(check && check.flag === 'Onboarding' || check.flag === 'Active'){
      // Fetching Mail Content
      const content = ou.activationOutput(check.employee.pin, check.employee.email);

      // If mail not sent then it will not activate
      transporter.sendMail(content, async function (err, info) {
        if (err) {
          console.log(err);
          return res.status(400).json({success: false, message: `Activation mail not sent & user is not Activated`});
        } else {
          // Updating Flag
          await Flag.update({flag:'Active'}, {where:{user_id:req.params.empId}});
          return res.status(200).json({
            success: true,
            message: `Activation mail has been successfully sent to ${check.employee.email}`
          });
        }
      });
    }else{
      return res.status(500).json({success:false, message:"Bad Request"});
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({success:false,message:"Something went wrong please try again later"});
  }

}


// Registering Employee (TESTED) 
exports.register_post = async(req,res)=>{
    try {
      // checking if password exists
        if(req.body.password){
          // hashing password
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            // fetching employee
            const employee = await Employee.findOne({
              where:{
                email: req.body.email
              },
              include:{
                model: Flag,
                attributes: ['flag']
              }
            });
            // checking if the employee email exists
            if(employee){
              if(!employee.password){
                // updating user and its flag & branch
                const user = await Employee.update({password: hashedPassword}, {where:{email: req.body.email}});
                const flag = await Flag.update({flag: 'Registered'}, {where:{employeeId: employee.id}});
                const branchRoles = await Role.findOne({where:{role:"Basic", branchId: employee.branchId}});
                // console.log(branchRoles.id)
                               await EmployeeRole.create({employeeId: employee.id, roleId:branchRoles.id })
                  return res.status(200).json({
                      success:true,
                      message: "You have successfully registered"
                  });

              }else{
                return res.status(400).json({success:false, message:"User has already been registered"})
              }
            } else{
                return res.status(404).json({
                    success:false,
                    message: 'No user found'
                });
            }
        }else{
            res.status(400).json({
                            success: false,
                            message: "passwords don't match"
                        });
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
    
}