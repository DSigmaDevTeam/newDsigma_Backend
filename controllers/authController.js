const DsUser = require('../models/dsigma/dsigmaUser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee  = require('../models/company/branch/employee/employee');
const Flag = require('../models/company/branch/employee/flag');
const EmployeeRole = require('../models/company/rolesAndPermissions/employeeRole');


// Dsigma User Login
exports.DsUser_login_post = async(req, res)=>{
    try {
        if(req.body.email && req.body.password){
            var dsUser = await DsUser.findOne({
                where:{
                    email:req.body.email
                }
            });
        }else{
            return res.status(400).json({
                success: false, message:`empty input`
            });
        }
        // console.log(`${req.body.password}, ${dsUser.password}`)
        if(dsUser && await bcrypt.compare(req.body.password, dsUser.password)){
            const key = process.env.ACCESS_TOKEN_SECRET;
            const accessToken = jwt.sign({user:dsUser.email}, key,{
                expiresIn: '30d'
            });
            return res.status(200).json({success: true, user:dsUser.email, JWT_TOKEN: accessToken});
        }else{
            return res.status(400).json({success: false, message:`Incorrect Credentials`});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message:`Something went wrong, Please try again later`});
    }
}

// Employee Login
exports.emp_login_post = async(req,res)=>{
    // console.log(req.body)
    try {
        // fetching employee
        const employee = await Employee.findOne({
            where:{
                email: req.body.email
            },
            include:[{
                model: Flag,
                attributes: ['flag']
            },
            {
                model: EmployeeRole,

            }
        ]
        }); 
        // Checking if the employee fetched has password
        if(employee && employee.password){
            // If Employee & pass exists verifying pass
            if(employee.password && await bcrypt.compare(req.body.password, employee.password)){
                const key = process.env.ACCESS_TOKEN_SECRET;
                        const accessToken = jwt.sign({user:employee.email}, key,{
                            expiresIn: '30d'
                        });
                        return res.status(200).json({
                            success: true,
                            user: employee.email,
                            flag: employee.flag.flag,
                            JWT_TOKEN: accessToken,
                            // emp: employee
                        });
            }else{
                // Returning error 
                res.status(401).json({
                    success: false,
                    message: "Incorrect Credentials"
                });
            }

        }else{
            // Returning error If password or email not found
            return res.status(404).json({
                success: false,
                message: "Unregistered User"
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:"Server Error"
        })
        
    }
}

