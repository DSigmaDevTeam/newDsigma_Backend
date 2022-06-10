const Employee = require('../models/company/branch/employee/employee');
const EmployeeDetails = require('../models/company/branch/employee/employeeDetails');
const ShiftTimeline = require('../models/company/branch/shift/shiftTimeline');
const Shift = require('../models/company/branch/shift/shift');



// GET SHIFT
exports.shift_get = async(req,res)=>{
    try {
        // Checking if shift exists
        const shift = await Shift.findOne({where:{id: req.params.shiftId}, include:[{model:ShiftTimeline}]});
        if(shift){
            // fetching user associated with shift
            const employee = await Employee.findOne({where:{id:shift.userId},  attributes:['id'], include:[{model:EmployeeDetails, attributes:['fname', 'lname']}]});
            let user = {};
            user['id'] = employee.id;
            user['name'] = employee.employee.fname.concat(' ', employee.employee.lname);
            return res.status(200).json({success: true, shift:shift, employee:user});
        }
        return res.status(400).json({success: false, message:`Bad request`});
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: `Something went wrong`});
    }
    
}

// GET SHIFTS


// CREATE SHIFT
exports.createShift_post = async(req,res)=>{
    try {
        // Checking if the Employee associated with shift exists.
        const user = Employee.findOne({where:{id:req.params.empId}});

        // Validating if break attribute is array.
        if(Array.isArray(req.body.break)&& user){
                await Shift.create({
                    userId: req.params.empId,
                    startTime: req.body.startTime,
                    endTime: req.body.endTime,
                    startDate: req.body.startDate,
                    endDate: req.body.endDate,
                    approved: true, 
                    status: "Completed",
                    break: req.body.break,
                    shiftWithoutBreak: req.body.shiftWithoutBreak,
                    totalShiftLength: req.body.totalShiftLength,
                    totalBreak: req.body.totalBreak,
                    startImage: 'N/A',
                    endImage:'N/A'

                });
                return res.json({success:true, message:`Shift has been created`});
        }else{
            return res.status(500).json({success: false, message:"Bad request"});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({success:false, message:`Something went wrong`});
    }
    }

// EDIT SHIFT
exports.shiftEdit_patch = async(req,res)=>{
    try {
        // Checking if the shift exists
        const shift = await Shift.findOne({where: {id:req.params.shiftId}});
        if (shift) {
            // Fetching logged in user
            const updatedBy = await User.findOne({where:{email: req.user}});
            // Updating shift
            Shift.update(req.body,{where:{id:req.params.shiftId}})
            .then(async() => {
                await ShiftTimeline.create({userId: updatedBy.id, 
                    shiftId: req.params.shiftId, 
                    message:`Shift has been updated by ${updatedBy.employee.fname} ${updatedBy.employee.lname}`
                });

            })
            return res.status(204).json({success:true, message:"details has been updated"});
        }else{
            return res.status(400).json({success:false, message:"Bad Request"});
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:"Something went wrong"});        
    }
}

// APPROVE SHIFT
exports.approve_patch = async(req, res)=>{
    try {
        // checking if the shift exists
        const shift = await Shift.findOne({where:{id:req.params.shiftId}});
        if (shift) {
             Shift.update({status: 'Approved'},{where:{id: req.params.shiftId}})
            .then(async(data)=>{
                const updatedBy = await Employee.findOne({where:{email: req.user}, include:[{model: EmployeeDetails}]})
                .then((data)=>{
                    await ShiftTimeline.create({message:`Shift has been updated by ${updatedBy.employee.fname} ${updatedBy.employee.lname}`});

                })

            })
            return res.status(200).json({success: true, message:`Shift has been approved`});
    }else{
        return res.status(400).json({success: false, message:`Bad Request`});
    }
    } catch (error) {
        console.error(error);
        return res.status(200).json({success: false, message:"Something went wrong"});
    }
}

// DELETE SHIFT
exports.shiftDelete_delete = async(req,res)=>{
    try {
        // Checking if the shift exists
        const shift = await Shift.findOne({where:{id: req.params.shiftId}});
        if (shift) {
            await Shift.destroy({where:{id:req.params.shiftId}});
            return res.status(200).json({success:true, message:`Shift has been deleted successfully`});
            
        }else{
            return res.status(400).json({success:false, message:`Bad Request`});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({success:false, message:"Something went wrong"});
    }
}