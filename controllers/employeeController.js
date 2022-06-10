const EmployeeDetails = require("../models/company/branch/employee/employeeDetails");
// const Role = require("../models/role");
const Flag = require("../models/company/branch/employee/flag");
const Employee = require("../models/company/branch/employee/employee");
const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const ou = require('../utils/output');
const bcrypt = require('bcrypt');
const {transporter} = require("../utils/transporter");
// const C = require('../models/company/rolesAndPermissions/employeeRole');
// const EmployeeRole = require("../models/company/rolesAndPermissions/employeeRole");


const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const SENDER_EMAIL = process.env.SENDER_EMAIL;


exports.form_post = async(req,res)=>{
  console.log(req.user);
  console.log(req.files);
  console.log(req.body);
  let file1;
  let file2;
  let file3;
  if(req.files.length === 3){
    file1 = req.files[0];
    file2 = req.files[1];
    file3 = req.files[2];
  }else if(req.files.length === 2){
    file1 = req.files[0];
    file2 = req.files[1];
    file3 = {path:null};
  } else{
    file1 = req.files[0];
    file2 = {path:null};
    file3 = {path: null};
  }
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
        // file1: file1.path,
        // file2: file2.path,
        // file3: file3.path,
      },{where:{userId: user.id}});

      // const emp = await Employee.update(req.body, {where:{userId: user.id}});  


// Updating Flag
      await Flag.update({flag: 'Onboarding'}, {where:{user_id: user.id}});

// Email Data
      console.log(req.body)
      const output = ou.onboardingOutput(req.body)

// Google & Nodemailer Config
                        const oAuth2Client = new google.auth.OAuth2(
                            CLIENT_ID,
                            CLIENT_SECRET,
                            REDIRECT_URI, 
                        );
                        oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
                        try {
                          const accessToken = await oAuth2Client.getAccessToken();
                      
                          const transport = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                              type: 'OAuth2',
                              user: SENDER_EMAIL,
                              clientId: CLIENT_ID,
                              clientSecret: CLIENT_SECRET,
                              refreshToken: REFRESH_TOKEN,
                              accessToken: accessToken,
                            },
                          });
                          const mailOptions = {
                            from: `Abdul Kabir <${SENDER_EMAIL}>`,
                            to: 'akabir247@gmail.com',
                            subject: `Dashify: New Employee Invitation for ${req.body.email}`,
                            html: output,
                          };
                      
                          const result = await transport.sendMail(mailOptions);
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


exports.employees_get = async(req,res)=>{
  try {
  const users = await Employee.findAll({where:{},
    order:[['createdAt', 'DESC']],
    attributes: ['email','createdAt', 'id'],
    include: [
             {model: Employee, attributes:['fname', 'lname', 'mobNumber', 'title']},
             {model:Flag, attributes:['flag']},

       ]
  });
    // console.log(user)
    return res.status(200).json({
      success:true,
      employees: users
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Server Error"
    })
  }

}

exports.employee_patch = async(req,res)=>{
  try {
      if(req.body.flag){
         await EmployeeDetails.update(req.body,{where:{userId: req.params.empId}});
         await Flag.update({flag:req.body.flag}, {where:{user_id:req.params.empId}});
         return res.status(201).json({
           success: true,
           message: "Details updated successfully"
         });
      }

      await EmployeeDetails.update(req.body,{where:{userId: req.params.empId}});
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

exports.employee_delete = async(req,res)=>{
  try {
    const emp = await Employee.destroy({where: {id: req.params.empId},truncate:true});
    const employee = await EmployeeDetails.destroy({where: {userId: req.params.empId},truncate:true});
    const U = await Flag.destroy({where: {user_id: req.params.empId}, truncate:true});
    return res.json({
      d: emp,
      flag: U
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success:false,
      message: error.message
    })
  }
}

exports.employee_get = async(req,res)=>{
  try {
    let result = {};
// fetching from DB
    const employee = await User.findOne({where:{id:req.params.empId}, 
    attributes: ['id', 'pin'],
    include: [
             {model: Employee,attributes:{exclude:['id', 'userId', 'createdAt', 'updatedAt']}},
             {model:Flag, attributes:['flag']},

       ]});
// Rearranging
       result['user_id'] = employee.id;
       result['flag'] = employee.flag.flag;
       result['pin'] = employee.pin;
       const emp = employee.toJSON();
       const len = Object.keys(emp.employee).length;
       for (let i = 0; i < len; i++) {
         result[Object.keys(emp.employee)[i]] = Object.values(emp.employee)[i]
         
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

exports.activateEmployee_patch = async (req, res)=>{
  try {
    const check = await Flag.findOne({where:{user_id: req.params.empId}, include:[{model: Employee}]});

    if(check && check.flag === 'Onboarding'){
      // Fetching Mail Content
      const content = ou.activationOutput(check.employee.pin, check.employee.email);

      transporter.sendMail(content, async function (err, info) {
        if (err) {
          console.log(err);
          return res.status(400).json({success: false, message: `Activation mail not sent`});
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

exports.register_post = async(req,res)=>{
    try {
        if(req.body.password){
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const employee = await Employee.findOne({
                where:{
                    email: req.body.email
                },
                include:{
                    model: Flag,
                    attributes: ['flag']
                }
            });
            if(employee){
                // const branchRoles = Role.findOne({where:{}})
                const user = await Employee.update({password: hashedPassword}, {where:{email: req.body.email}});
                const flag = await Flag.update({flag: 'Registered'}, {where:{user_id: employee.id}});
                            //  await EmployeeRole.create({employeeId: employee.id, RoleId: })
                return res.status(200).json({
                    success:true,
                    message: "You have successfully registered"
                });
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