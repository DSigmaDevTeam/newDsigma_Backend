const Employee = require('../models/company/branch/employee/employee');
const EmployeeDetails = require('../models/company/branch/employee/employeeDetails');
const ShiftTimeline = require('../models/company/branch/shift/shiftTimeline');
const Shift = require('../models/company/branch/shift/shift');
const Flag = require('../models/company/branch/employee/flag');



// GET SHIFT (TESTED)
exports.shift_get = async(req,res)=>{
    try {
        // Checking if shift exists
        const shift = await Shift.findOne({where:{id: req.params.shiftId}, include:[{model:ShiftTimeline}]});
        if(shift){
            // fetching user associated with shift
            const employee = await Employee.findOne({where:{id:shift.employeeId},  attributes:['id'], include:[{model:EmployeeDetails, attributes:['fname', 'lname']}]});
            console.log(employee.toJSON())
            let user = {};
            user['id'] = employee.id;
            user['name'] = employee.employeeDetail.fname.concat(' ', employee.employeeDetail.lname);
            return res.status(200).json({success: true, shift:shift, employee:user});
        }
        return res.status(400).json({success: false, message:`Bad request`});
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: `Something went wrong`});
    }
    
}

// GET SHIFTS (TESTED)
exports.shifts_get = async (req,res)=>{
    try {
        // Fetching Employees & their details
        const users = await Employee.findAll({where:{}, 
            order:[['createdAt', 'DESC']],
        attributes: ['email','createdAt', 'id'], 
        include: [ 
            {
            model: Flag, 
             where:{flag:'Active'}, attributes: ['flag']
            },
            {model:EmployeeDetails, attributes:['fname', 'lname', 'mobNumber', 'title']},
            {model: Shift, include:[{model: ShiftTimeline}]},
        ]
    });
        return res.status(200).json({
            success: true,
            user:users
        }); 
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: 'Something went wrong'});
    }
}

// CREATE SHIFT (TESTED)
exports.createShift_post = async(req,res)=>{
    try {
        // Checking if the Employee associated with shift exists.
        const user = Employee.findOne({where:{id:req.params.empId}});

        // Validating if break attribute is array.
        if(Array.isArray(req.body.break)&& user){
                await Shift.create({
                    employeeId: req.params.empId,
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

// EDIT SHIFT (TESTED)
exports.shiftEdit_patch = async(req,res)=>{
    try {
        // Checking if the shift exists
        const shift = await Shift.findOne({where: {id:req.params.shiftId}});
        if (shift) {
            // Fetching logged in user
            const updatedBy = await Employee.findOne({where:{email: req.user}, include:[{model:EmployeeDetails}]});
            // Updating shift
            Shift.update(req.body,{where:{id:req.params.shiftId}})
            .then(async() => {
                await ShiftTimeline.create({employeeId: updatedBy.id, 
                    shiftId: req.params.shiftId, 
                    message:`Shift has been updated by ${updatedBy.employeeDetail.fname} ${updatedBy.employeeDetail.lname}`
                });

            })
            return res.status(200).json({success:true, message:"details has been updated"});
        }else{
            return res.status(400).json({success:false, message:"Bad Request"});
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:"Something went wrong"});        
    }
}

// APPROVE SHIFT (TESTED)
exports.approve_patch = async(req, res)=>{
    try {
        // checking if the shift exists
        const shift = await Shift.findOne({where:{id:req.params.shiftId}});
        if (shift) {
             Shift.update({approved: 'true'},{where:{id: req.params.shiftId}})
            .then(async(data)=>{
                const updatedBy = await Employee.findOne({where:{email: req.user}, include:[{model: EmployeeDetails}]})
                .then(async(data)=>{
                    await ShiftTimeline.create({message:`Shift has been updated by ${data.employeeDetail.fname} ${data.employeeDetail.lname}`,
                     employeeId:data.id,
                     shiftId: req.params.shiftId
                    
                    });

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

// DELETE SHIFT (NOT TESTED)
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