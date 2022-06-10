const Company = require('../models/company/company');
const DsUser = require('../models/dsigma/dsigmaUser');
const codeGen = require('../utils/pinGenerator');

exports.register_post = async(req,res)=>{
    try {
        const code = await codeGen.companyCodeGen(req.body.name);
        console.log(code);
        const dsUser = await DsUser.findOne({where:{
            email: req.user
        }})
        await Company.create({
            name:req.body.name,
            description:req.body.description,
            dsigmaUserId: dsUser.id,
            code: code
        });
        return res.status(200).json({success: true, message:`Company has successfully been resgistered`})
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:`Something went wrong, Please try again later`});
    }
}
