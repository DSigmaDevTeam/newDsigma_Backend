const nodemailer = require('nodemailer');
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
    let mailOptions = {
      from: 'dsigmatesting@gmail.com',
      to: req.body.email,
      subject: `DSigma: New Employee Invitation for ${req.body.email.toLowerCase()}`,
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>DSigma Email</title>
      </head>
      <body style="background-color: rgb(201, 201, 201);">
          <header>
              
          </header>
      
      <table style="margin: auto; background-color: white;">
          <tbody>
              <tr>
                  <td id="logo" style="display:block; text-align: center;">
                      <img src="https://i.im.ge/2022/06/19/re2zMa.png" alt="DSigma logo" width="150px">
                  </td>
              </tr>
              <tr>
                  <th style="font-size:20px; padding: 10px;">Hi ${req.body.email.toLowerCase()}</th>
              </tr>
              <tr style="text-align: center;">
                  <td style="text-align:center;">You have been invited by <strong>Hardik Pokiya</strong> to join DSigma</td>
              </tr>
      
              <tr style="text-align: center;">
                      <td>
                          <table style="text-align: center; margin: auto; border: 3px solid;">
                              <tr>
                              <th style="padding: 10px; font-size:20px" >
                                  New to DSigma? 
                               </th>
                              </tr>
                              <tr>
                               <td style="text-align:center;">
                                   If you don't have an account please
                               </td>
                              </tr>
                              <tr>
                               <td style="text-align:center; padding: 10px;">
                              <a href="https://app.dsigma.net/signup">
                               <button style="background-color:black; color:white; padding: 5px; border-radius: 5px;">Register Now</button>
                              </a> 
                              </td>
                              </tr>
                          </table>
                      </td>
              </tr>
      
              <tr>
                  <td style="text-align:center; padding: 10px;">NEED HELP?</td>
              </tr>
              <tr>
                  <td style="text-align:center; padding: 10px">Please click the <u>"Sign Up"</u>. tab to create your account once you click the register link provided.</td>
              </tr>
              <tr>
                  <td style="text-align:center; padding: 10px">Having troubles creating an account or signing in, please contact the DSigma<br>team by email, <u>support@dsigma.com.au</u>, our team will gladly assit you.</td>
              </tr>
              <tr>
                  <td style="text-align:center; padding: 15px"><img src="https://dsigma.net/assets/images/dsigma-logo.png" alt="Dsigma logo" width="100px"></td>
              </tr>
              <tr>
                  <td style="text-align:center;"><strong>DSigma LLP.</strong></td>
              </tr>
              <tr>
                  <td style="text-align:center;">Restaurant & Business Management Software</td>
              </tr>    
              <tr>    
                  <td style="text-align:center;">Learn how you can simplify and transform your business today!</td>
              </tr>
          </tbody>   
      </table>
      
      </body>
      </html>`
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
        // return res.status(400).json({success: false, message: `User Created, But email not sent`});
      } 
        // return res.status(200).json({
        //   success: true,
        //   message: `Mail has been successfully sent to ${req.body.email}`
        // });
      
      
    });
      // Fetching BASIC Role Id
        const role = await Role.findOne({where:{
          role: 'Basic',
          branchId: req.params.branchId
        }});
        console.log(role)
    //   Validating if role Exists
        if(!role){
          return res.status(500).json({success: false, message: 'Something went wrong during the process'});
        }
    //   Generating Employee PIN 
        const pin  = await pinGenerator.userPinGen();
        var email = await Employee.create({
            email: req.body.email.toLowerCase(),
            pin:pin,
            branchId: req.params.branchId,
            roleId: role.id,
            shiftStatus: "Not Working",
            currentBranchId: req.params.branchId,
            isAdmin: false
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
        await EmployeeDetails.create({workEmail: req.body.email.toLowerCase(), userId: email.id, employeeId: email.id})
        return res.status(200).json({
          success: true,
          message: `Mail has been successfully sent to ${req.body.email.toLowerCase()}`
        });
    } catch (error) {
        console.log(`post Employee error: ${error}`);
        return res.status(500).json({
            success:false,
            message:'Server Error please try again later'
        });
    }
   

}


