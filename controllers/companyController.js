const Company = require('../models/company/company');
const DsUser = require('../models/dsigma/dsigmaUser');
const codeGen = require('../utils/pinGenerator');
const AdminFlag = require('../models/dsigma/adminFlag');

exports.register_post = async(req,res)=>{
    try {
        const code = await codeGen.companyCodeGen(req.body.name);
        const dsUser = await DsUser.findOne({where:{
            email: req.user
        }});
        const company = await Company.findOne({where:{dsigmaUserId: dsUser.id}});

        if(company){
            return res.status(400).json({success: false, message:"This user has already registered a company"})
        }
        // If dsUser exists and required fields exists in body
        if(dsUser && req.body.firstName, req.body.lastName, req.body.DOB, req.body.name, req.body.name){
            Company.create({
               name:req.body.name,
               description:req.body.description,
               dsigmaUserId: dsUser.id,
               code: code
           }).then(async(company)=>{
               await DsUser.update({companyRegistered: true,
                 firstName:req.body.firstName,
                 lastName: req.body.lastName,
                 DOB:req.body.DOB,
                 gender: req.body.gender,
                mobileNumber: req.body.mobileNumber},{where:{id:company.dsigmaUserId}});

                await AdminFlag.update({flag:"Company Registered"}, {where:{dsigmaUserId:company.dsigmaUserId}})
           });
           return res.status(200).json({success: true, message:`Company has successfully been registered`});
           

        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:`Something went wrong, Please try again later`});
    }
}
