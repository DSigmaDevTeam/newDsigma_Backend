const Role = require('../models/company/rolesAndPermissions/role');

exports.createRole_post = async(req,res)=>{
    const role = await Role.create({
        role: req.body.role,
        description: req.body.description,
        branchId: req.params.branchId
    });
    // const permission = await 
}