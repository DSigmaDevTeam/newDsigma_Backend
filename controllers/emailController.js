const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const Employee = require("../models/company/branch/employee/employee");
const Flag = require("../models/company/branch/employee/flag");
const output = require('../utils/output');
const email = require('../utils/email');
const EmployeeDetails = require('../models/company/branch/employee/employeeDetails');
const pinGenerator = require('../utils/pinGenerator')
const {transporter} = require("../utils/transporter");
const Branch = require('../models/company/branch/branch');
const Role = require('../models/company/rolesAndPermissions/role');


exports.email_post = async(req, res)=>{
    try {
      // Fetching BASIC Role Id
        const role = await Role.findOne({where:{
          role: 'Basic',
          branchId: req.params.branchId
        }});
        console.log(role)
      // Validating if role Exists
        if(!role){
          return res.status(500).json({success: false, message: 'Something went wrong during the process'});
        }
      //Generating Employee PIN 
        const pin  = await pinGenerator.userPinGen();
        var email = await Employee.create({
            email: req.body.email,
            pin:pin,
            branchId: req.params.branchId,
            roleId: role.id,
            shiftStatus: "Not Working"
            // isBranchManager: false
        });

        //Creating Status Flag 
        const flag = await Flag.create({
            flag:"Email Sent",
            user_id: email.id,
            employeeId: email.id
        });
        console.log(email.id)
        console.log(req.body.email)

        // Creating Employee Details Table
        await EmployeeDetails.create({workEmail: req.body.email, userId: email.id, employeeId: email.id})
    } catch (error) {
        console.log(`post Employee error: ${error}`);
        return res.status(500).json({
            success:false,
            message:'Server Error while inserting user & Flag'
        });
    }
    const content = output.inviteOutput(req.body.email);
    try {

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
          console.log(err);
          return res.status(400).json({success: false, message: `User Created, But email not sent`});
        } else {
          return res.status(200).json({
            success: true,
            message: `Mail has been successfully sent to ${req.body.email}`
          });
        }
        
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message:'Server Error'
      });
    }

}


