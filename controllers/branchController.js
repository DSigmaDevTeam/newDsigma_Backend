const Branch = require('../models/company/branch/branch');
const Company = require('../models/company/company');
const Role = require('../models/company/rolesAndPermissions/role');
const Permission = require('../models/company/rolesAndPermissions/permission');
const pinGenerator = require('../utils/pinGenerator');
const DSuser = require('../models/dsigma/dsigmaUser');
const AdminFlag = require('../models/dsigma/adminFlag');
const jwt = require('jsonwebtoken');
const Employee = require('../models/company/branch/employee/employee');
const Flag = require('../models/company/branch/employee/flag');


// Registering Branch
exports.register_post = async (req, res) => {
    try {
        // console.log(req.body);
        // fetching the company
        const company = await Company.findOne({ where: { id: req.params.companyId } });
        const dsUser = await DSuser.findOne({ where: { email: req.user}, include:[{model:AdminFlag}]})

        // checking if company and branchName Exists
        if (req.body.name && company) {

            const code = await pinGenerator.branchPinGen();
            const branchName =  pinGenerator.removeNonAlphabet(req.body.name);
                console.log("PREPROCESSED BRANCH NAME", branchName)
            do {
                const bh = await pinGenerator.branchCodeGen(branchName);
                console.log("Ye BH hai", bh);
                var kioskId = `${company.code}-${bh}`
                var kioskIdCheck = await Branch.findOne({ where: { kioskId: kioskId } })

            } while (kioskIdCheck !== null);
                
            const branch = await Branch.create({
                name: req.body.name,
                // description: req.body.description,
                companyId: req.params.companyId,
                code: code,
                kioskId: kioskId,
                ABN: req.body.ABN,
                website: req.body.website,
                phone: req.body.phone,
                email: req.body.email,
                location: req.body.location,
                address: req.body.address,
                address2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                postCode: req.body.postCode,
                country: req.body.country,
                facebook: req.body.facebook,
                instagram: req.body.instagram,
                linkedIn: req.body.linkedIn,
                twitter: req.body.twitter,
                bankName: req.body.bankName,
                BSB: req.body.BSB,
                accountNumber: req.body.accountNumber,
                employee: req.body.employee,
                logo: req.files.branchLogo[0].location,
            });
            const role = await Role.create({
                role: 'Basic',
                description: "Basic Access",
                branchId: branch.id
            });
            console.log(req.user);
            const DsUser = await DSuser.update({ currentBranchId: branch.id }, { where: { email: req.user } });

            const key = process.env.ACCESS_TOKEN_SECRET;
            const accessToken = jwt.sign({user:dsUser.email}, key,{
                expiresIn: '30d'
            });

            // console.log("Ye File Hai",req.files.branchLogo[0])

            return res.status(200).json({ 
                 success: true,
                 message: `${branch.name} has been successfully created`,
                 user:dsUser.email, 
                    isAdmin: dsUser.isAdmin,
                    companyRegistered: dsUser.companyRegistered,
                    currentBranchId: branch.id,
                    JWT_TOKEN: accessToken,
                    flag: dsUser.adminFlag.flag,
                    companyName: company.name,
                    companyId: company.id,
                    branchName: branch.name,
                    branchLogo: req.files.branchLogo[0].location
                });


        } else {
            return res.status(400).json({ success: false, message: "Bad request" })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: `Something went wrong, Please try again later` });
    }
}

// Fetching all branches
exports.branches_get = async (req, res) => {
    try {
        DSuser.findOne({ where: { email: req.user }, include: [{ model: Company }] }).then((DSuser) => {
            Company.findOne({ where: { id: DSuser.company.id } })
                .then(async (company) => {
                    const branches = await Branch.findAll({ where: { companyId: company.id } });
                    return res.status(200).json({ success: true, branches: branches });
                });

        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something went wrong, Please try again later" })
    }
}

// Switching Branch
exports.switchBranch_get = async (req, res) => {
    try {
        
        // check if the switched branch id Exists
        const branch = await Branch.findOne({where:{id:req.params.branchId}});
        if(branch){
            const company = await Company.findOne({where:{id: branch.companyId}});
            const dsUser = await DSuser.findOne({where:{email:req.user}});
            const employee = await Employee.findOne({where:{email:req.user}});
            
            // check if the user is a DSigma user or an employee
            if(dsUser){
                // update the branch id to the employee or dsUser
                await DSuser.update({currentBranchId: branch.id},{where:{id:dsUser.id}});
                const key = process.env.ACCESS_TOKEN_SECRET;
                    const accessToken = jwt.sign({user:dsUser.email}, key,{
                        expiresIn: '30d'
                    });
                    const user = await DSuser.findOne({where:{id:dsUser.id}, include:[{model:AdminFlag}]});
                    // const company = await Company.findOne({where:{companyId: branch.companyId}});

                    return res.status(200).json({success: false, 
                        message:`Successfully switched to ${company.name} - ${branch.name}`,
                        user:user.email, 
                        isAdmin: user.isAdmin,
                        companyRegistered: user.companyRegistered,
                        currentBranchId: user.currentBranchId,
                        JWT_TOKEN: accessToken,
                        flag: user.adminFlag.flag,
                        companyName: company.name,
                        companyId: company.id,
                        branchName: branch.name,
                        branchLogo: branch.logo
                    })
            }else if(employee){
                // update the branch id to the employee
                await Employee.update({currentBranchId:branch.id},{where:{user}});
                const key = process.env.ACCESS_TOKEN_SECRET;
                    const accessToken = jwt.sign({user:employee.email}, key,{
                        expiresIn: '30d'
                    });
                    const user = await Employee.findOne({where:{id:employee.id}, include:[{model:Flag}]});
                    
                    return res.status(200).json({success: false, 
                        message:`Successfully switched to ${company.name} - ${branch.name}`,
                        user:user.email, 
                        isAdmin: user.isAdmin,
                        companyRegistered: user.companyRegistered,
                        currentBranchId: user.currentBranchId,
                        JWT_TOKEN: accessToken,
                        flag: user.adminFlag.flag,
                        companyName: company.name,
                        companyId: company.id,
                        branchName: branch.name,
                        branchLogo: branch.logo
                    })
            }else{
                return res.status(400).json({success:false, message:"Bad Method Call"});
            }
    
        }else{
            return res.status(404).json({success:false, message:"Invalid branch ID"})
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:"Something went wrong, Please try again later"})
    }
} 

// Fetching Single Branch
exports.branch_get = async(req, res)=>{
    try {
        const DsUser = await DSuser.findOne({where:{email:req.user}});
        const employee = await Employee.findOne({where:{email:req.user}});
        if(DsUser){
            const branch = await Branch.findOne({where:{id:DsUser.currentBranchId}});
            return res.status(200).json({success:true, branch:branch});
        }else if(employee){
            const branch = await Branch.findOne({where:{id:employee.currentBranchId}});
            return res.status(200).json({success:true, branch:branch}); 
        }else{
            return res.status(400).json({success:false, message:"Bad Method Call"});
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:"something went wrong, Please try again later"});
    }
}