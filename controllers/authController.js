const DsUser = require('../models/dsigma/dsigmaUser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee  = require('../models/company/branch/employee/employee');
const Branch  = require('../models/company/branch/branch');
const Company  = require('../models/company/company');
const Flag = require('../models/company/branch/employee/flag');
const EmployeeRole = require('../models/company/rolesAndPermissions/employeeRole');
const AdminFlag = require('../models/dsigma/adminFlag')


// DSigma User Login
exports.DsUser_login_post = async(req, res)=>{
    try {
        if(req.body.email && req.body.password){
            var dsUser = await DsUser.findOne({
                where:{
                    email:req.body.email
                },
                include:[{
                    model:Company,include:[{model:Branch}]
                }, {model:AdminFlag}]
            });

            var branchName = await Branch.findOne({where:{id:dsUser.currentBranchId}}) 
        }else{
            return res.status(400).json({
                success: false, message:`empty input`
            });
        }
        if(dsUser && await bcrypt.compare(req.body.password, dsUser.password)){
            const key = process.env.ACCESS_TOKEN_SECRET;
            const accessToken = jwt.sign({user:dsUser.email}, key,{
                expiresIn: '30d'
            });
            if(dsUser.adminFlag.flag === "Signed Up" ){
                return res.status(200).json({success: true, user:dsUser.email, isAdmin: dsUser.isAdmin,
                    companyRegistered: dsUser.companyRegistered,
                    currentBranchId: null,
                    flag: dsUser.adminFlag.flag,JWT_TOKEN: accessToken,
                    companyName: null,
                    companyId: null,
                    branchName: null 
                });    
            }else{

                return res.status(200).json({success: true,
                    user:dsUser.email, 
                    isAdmin: dsUser.isAdmin,
                    companyRegistered: dsUser.companyRegistered,
                    currentBranchId: dsUser.currentBranchId,
                    flag: dsUser.adminFlag.flag,
                    JWT_TOKEN: accessToken,
                    companyName: dsUser.company.name,
                    companyId: dsUser.company.id,
                    branchName: branchName? branchName.name :null 
                });
            }

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
                            currentBranchId: employee.branchId,
                            isAdmin: employee.isAdmin,
                            branchId: employee.branchId,
                            employeeId: employee.id
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
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:"Server Error"
        })
        
    }
}

