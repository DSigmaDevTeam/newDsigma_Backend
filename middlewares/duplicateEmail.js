const Employee = require("../models/company/branch/employee/employee");


module.exports = async function duplicateEmail(req, res, next){
    try {
        const employee = await Employee.findOne({where:{email: req.body.email}})
        // console.log(user);
        if(employee){
            return res.status(400).json({
                success:false,
                message: "This user has already been invited"
            });
        }
        else{
            return next();
        }   
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Server Error"
        });
    }
}