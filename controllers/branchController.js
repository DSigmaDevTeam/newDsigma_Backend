const Branch = require('../models/company/branch/branch');
const Company = require('../models/company/company');
const Role = require('../models/company/rolesAndPermissions/role');
const Permission = require('../models/company/rolesAndPermissions/permission');
const pinGenerator = require('../utils/pinGenerator')
const DSuser = require('../models/dsigma/dsigmaUser');

exports.register_post = async(req,res)=>{
    try {   
            const code = await pinGenerator.branchPinGen();
            const company = await Company.findOne({where:{id:req.params.companyId}});
            do {
                const bh = await pinGenerator.branchCodeGen(req.body.name);
                console.log(bh);
                var kioskId = `${company.code}-${bh}`
                var kioskIdCheck = await Branch.findOne({where:{kioskId:kioskId}})
                
            } while (kioskIdCheck !== null);

            const branch = await Branch.create({
                name: req.body.name,
                description: req.body.description,
                companyId: req.params.companyId,
                code: code,
                kioskId: kioskId 
            });
            const role = await Role.create({
                role: 'Basic',
                description: "Basic Access",
                branchId: branch.id
            });
            console.log(req.user)
            const DsUser = await DSuser.update({currentBranchId: branch.id},{where:{email:req.user}});

            return res.status(200).json({success: true, message: `${branch.name} has been successfully created`});

    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message:`Something went wrong, Please try again later`});
    }    
}