const sequelize = require("sequelize");
const Branch = require('../models/company/branch/branch');
const Employee = require('../models/company/branch/employee/employee');
const Flag = require('../models/company/branch/employee/flag');
const Shift = require('../models/company/branch/shift/shift');
const ShiftTimeline = require('../models/company/branch/shift/shiftTimeline');
const EmployeeDetails = require('../models/company/branch/employee/employeeDetails');
const jwt = require('jsonwebtoken');
const times = require('../utils/timeCalculator');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require("multer-s3-v2");




function addTimes(time1, time2) {
    var time1 = time1.split(':');
         var time2 = time2.split(':');
         var hours = Number(time1[0]) + Number(time2[0]);
         var minutes = Number(time1[1]) + Number(time2[1]);
         var seconds = Number(time1[2]) + Number(time2[2]);
         if (seconds >= 60) {
      minutes += Math.floor(seconds / 60);
      seconds = seconds % 60;
         }
         if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes = minutes % 60;
         }
         return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }


exports.login_post = async(req,res)=>{
    try {
        console.log(req.body)
        const branch = await Branch.findOne({where:{kioskId:req.body.companyId}});
        console.log(branch)
            if(branch){
                const key = process.env.ACCESS_TOKEN_SECRET;
                const accessToken = jwt.sign({branchId:branch.id}, key,{
                    expiresIn: '30d'
                });
                return res.status(200).json({
                    success: true,
                    JWT_TOKEN: accessToken,
                });
            }else{
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Credentials'
                });
            }        
    } catch (error) {
        console.error(error);
        return res.status(500).json({success:false, message: `Something went wrong, Please try again later`});
    }
}


exports.dashboard_get = async(req, res) => {
    try {
        // console.log(req.branchId);
        // console.log(req.branchId);
        // fetching all employees
        const employees = await Employee.findAll({where:{branchId: req.branchId}, 
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
    // console.log(employees)
    // fetching working employees
    const workingEmployees = await Employee.findAll({where:{branchId: req.branchId},
        order:[['createdAt', 'DESC']],
        attributes: ['email', 'id'],
        include:[
            {
                model:Flag,
                where:{flag:'Active'}, attributes:['flag']
            },
            {
                model:EmployeeDetails, attributes:['fname', 'lname', 'mobNumber', 'title']
            },
            {
                model: Shift, 
                where:{status: 'Active'},
                include:[{model: ShiftTimeline}]
            }
        ]
    })
    // console.log(workingEmployees)
        return res.status(200).json({
            success: true,
            employees:employees,
            workingEmployees: workingEmployees
        }); 
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({success: false, message: 'Something went wrong'});
    }
}


exports.employeeLogin_post = async(req, res) => {
    try {
        const employee = await Employee.findOne({where:{id: req.params.employeeId, branchId:req.branchId, pin: req.body.pin}, 
            include:[{model:Shift, order:[['createdAt','DESC']]}, {model:EmployeeDetails}]
        });
        console.log(employee)
        if (employee) {
            const key = process.env.ACCESS_TOKEN_SECRET;
                const accessToken = jwt.sign({user:employee.email}, key,{
                    expiresIn: '30d'
                });           
            return res.status(200).json({success:true, message:`Login Successful`,employee:employee, accessToken:accessToken});
        }else{
            return res.status(400).json({success:false, message:`Employee not found`})
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({success:true, message:`Something went wrong, Please try again`})
    }
}



const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION,
});

const upload = (bucketName) =>
  multer({
    storage: multerS3({
      s3,
      bucket: bucketName,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(null, `image-${Date.now()}.jpeg`);
      },
    }),
  });


exports.employeeStartShift_post = async(req,res)=>{
    const date_ob = new Date();
    // Time
    const hours = date_ob.getHours();
    const minutes = date_ob.getMinutes();
    const seconds = date_ob.getSeconds();
    const time = hours + ":" + minutes + ":" + seconds
    // Date
    const day = ("0" + date_ob.getDate()).slice(-2);
    const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    const year = date_ob.getFullYear();
    const date = year + "-" + month + "-" + day;
    let imageRoute = ""

    try {
        const shift = await Employee.findOne({where:{email:req.user}, include:[{
            model:Shift, 
            where:{status:'Active'}
        }]});
        if(shift){
            return res.status(400).json({success:false, message:`Employee already has an Active shift`})
        }

        // Uploading StartShift Image to AWS
        // replace StartShiftImage with frontend se jo b image attribute ka naam hai
        const uploadSingle = upload("dsigmas3").single(
    "StartShiftImage"
  );

        uploadSingle(req, res, async(err)=>{
            if (err) {
                console.log(err)
                return res.status(400).json({success:false, message: `Error while uploading the Image to aws ERROR:${err.message}`});
            }
            
            if(req.file) {

                const employee = Employee.findOne({where:{email:req.user}})
                .then((data)=>{
                    console.log(data.toJSON())
                    const shiftStart = Shift.create({
                        startTime: time,
                        startDate: date,
                        startImage: req.file.location,
                        employeeId: data.id,
                        status:`Active`,
                        totalBreak: `00:00:00`
                    }).then((data)=>{
                        ShiftTimeline.create({
                            shiftId: data.id,
                            message:"Started Shift"
                        }).then((data)=>{
                            return res.status(200).json({success:true, message:`Your shift has been started at TIME: ${time} DATE: ${date}`, startImage: 'ImageLink'});
                        })
                    })
                }).catch((err)=>{
                    console.log(err);
                    return res.status(500).json({success:false, message:`Something went wrong Please try again later`})
                })  
            } else{
                const employee = Employee.findOne({where:{email:req.user}})
                .then((data)=>{
                    console.log(data.toJSON())
                    const shiftStart = Shift.create({
                        startTime: time,
                        startDate: date,
                        startImage: "N/A",
                        employeeId: data.id,
                        status:`Active`,
                        totalBreak: `00:00:00`
                    }).then((data)=>{
                        ShiftTimeline.create({
                            shiftId: data.id,
                            message:"Started Shift"
                        }).then((data)=>{
                            return res.status(200).json({success:true, message:`Your shift has been started at TIME: ${time} DATE: ${date}`, startImage: 'ImageLink'});
                        })
                    })
                }).catch((err)=>{
                    console.log(err);
                    return res.status(500).json({success:false, message:`Something went wrong Please try again later`})
                })  
            }
            // return res.send(imageRoute)
        })

        
    } catch (error) {
        console.error(error);
        return res.status(500).json({success:false, message:`Something went wrong while starting the shift`});
    }

}


// Start Break
exports.employeeStartBreak_patch = async(req,res)=>{
    const date_ob = new Date();
    // Time
    const hours = date_ob.getHours();
    const minutes = date_ob.getMinutes();
    const seconds = date_ob.getSeconds();
    const time = hours + ":" + minutes + ":" + seconds
    // Date
    const day = ("0" + date_ob.getDate()).slice(-2);
    const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    const year = date_ob.getFullYear();
    const date = year + "-" + month + "-" + day;

    try {
        // Validating Employee's Existence 
        const employee = await Employee.findOne({where:{email:req.user}});
        const shift = await Shift.findOne({where:{employeeId:employee.id},order: [ [ 'createdAt', 'DESC' ]],});

        // checking if the shift is active 
        if(shift.status === 'Active'){

            // checking if the shift's break is null
            if(shift.break != null && shift.break.at(-1).start && !shift.break.at(-1).end){
                return res.status(400).json({success: false, message: 'Bad Method Call'})
            }else{
                const startBreak = {"start":time}
            const sh = await Shift.update({break: sequelize.fn('array_append', sequelize.col('break'), JSON.stringify(startBreak))} ,{where:{id:shift.id}});
            return res.status(200).json({success:true, message:`Break started TIME: ${startBreak.start}`});
            }
        }else{
            return res.status(400).json({success:false, message:`Employee does not have any Active shift`})

        }
    } catch (error) {
        console.log(error);
        res.status(500).json({success:false, message:`Something went wrong, Please try again later`});
    }
}


// END BREAK
exports.employeeEndBreak_patch = async(req, res)=>{
    const date_ob = new Date();
    // Time
    const hours = date_ob.getHours();
    const minutes = date_ob.getMinutes();
    const seconds = date_ob.getSeconds();
    const time = hours + ":" + minutes + ":" + seconds
    // Date
    const day = ("0" + date_ob.getDate()).slice(-2);
    const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    const year = date_ob.getFullYear();
    const date = year + "-" + month + "-" + day;
    
    try {

        // check if that Active shift exists
        const employeeWithActiveShift = await Employee.findOne({where:{email:req.user},include:[{model: Shift,  where:{status:'Active'}}]});
        // console.log(employeeWithActiveShift.shifts[0].id);
        if (employeeWithActiveShift) {

            // check if the shift has a started Break
            const shift = await Shift.findOne({where:{id: employeeWithActiveShift.shifts[0].id}});
            if(shift.break.at(-1).end){
                return res.status(400).json({success:false, message:`Shift has already ended`});
            }

            //Ending Break
            const endBreak = {"end": time}
            const totalBreakTime = times.breakTimeCalculator(shift.break.at(-1).start, time);
            console.log(totalBreakTime);
            console.log(totalBreakTime);

            // Check if the totalBreakTime in DB is not === 00:00:00
            if(shift.totalBreak === `00:00:00`){
               const breakEnd =  await Shift.update({
                   break:sequelize.fn('array_append', sequelize.col('break'), JSON.stringify(endBreak)), 
                   totalBreak: totalBreakTime}, 
                   {where:{id:shift.id}
                });
                return res.status(200).json({success:true, message:`Break Ended TIME: ${endBreak.end}`})
            }else{

                // Adding existing time to the new time 
                const totalBreak = addTimes(shift.totalBreak, totalBreakTime);
                const breakEnd =  await Shift.update({
                    break:sequelize.fn('array_append', sequelize.col('break'), JSON.stringify(endBreak)), 
                    totalBreak: totalBreak}, 
                    {where:{id:shift.id}
                 });
                 return res.status(200).json({success:true, message:`Break Ended TIME: ${endBreak.end}`})
            } 
            
        }else{
            return res.status(400).json({success:false, message:`No Active shifts exists`});
        }
    } catch (error) {
        console.log(error)
        return res.json({error: error.message})
    }
}

// EndBreak
exports.employeeEndShift_patch = async(req,res)=>{
    try {
        const date_ob = new Date();
        // Time
        const hours = date_ob.getHours();
        const minutes = date_ob.getMinutes();
        const seconds = date_ob.getSeconds();
        const time = hours + ":" + minutes + ":" + seconds
        // Date
        const day = ("0" + date_ob.getDate()).slice(-2);
        const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        const year = date_ob.getFullYear();
        const date = year + "-" + month + "-" + day;    

        // check if the employee & shift Exists
        const employeeWithActiveShift = await Employee.findOne({where:{email:req.user}, include:[{
            model:Shift, 
            where:{status:'Active'}
        }]});
        if(!employeeWithActiveShift){
            return res.status(400).json({success:false, message:`Employee has no Active shifts`})
        }
        
        // fetching Shift
        const shift = await Shift.findOne({where:{id: employeeWithActiveShift.shifts[0].id}});
        const totalShiftTime = times.totalShiftTime(shift.startTime, time);
        const shiftWithoutBreak = times.breakTimeCalculator(totalShiftTime, shift.totalBreak)

        const uploadSingle = upload("dsigmas3").single(
            "EndShiftImage"
          );
        uploadSingle(req,res, async(err)=>{
            if(err){
                console.log(err)
                return res.status(400).json({success:false, message: `Error while uploading the Image to aws ERROR:${err.message}`});
            }
            console.log(req.file)
            if(req.file){
                var endImageRoute = req.file.location
            }else{
                var endImageRoute = "N/A"
            }
            // console.log(imageRoute);
            if(shift.break == null || shift.break.at(-1).end){
                 Shift.update({
                    endTime: time,
                    endDate: date,
                    totalShiftLength: totalShiftTime,
                    shiftWithoutBreak: shiftWithoutBreak,
                    endImage: endImageRoute,
                    status: 'Completed'
                }, {where:{id: shift.id}})
                .then(async(data)=>{
                    await ShiftTimeline.create({
                        shiftId: shift.id,
                        message: "Ended Shift"
                    })
                });
                return res.status(200).json({success: true, message:`Shift has ended at TIME: ${time}`});
            }else{
                // Calculate the total time
                // check if the total time in db is 00:00:00
                const endBreak = {"end": time}
                const totalBreakTime = times.breakTimeCalculator(shift.break.at(-1).start, time);
                const shiftwithoutBreak = times.breakTimeCalculator(totalShiftTime, totalBreakTime)
    
            
                if(shift.totalBreak === `00:00:00`){
                    const breakEnd = Shift.update({
                        break:sequelize.fn('array_append', sequelize.col('break'), JSON.stringify(endBreak)), 
                        totalBreak: totalBreakTime,
                        endImage: endImageRoute,
                        totalShiftLength: totalShiftTime,
                        shiftWithoutBreak: shiftwithoutBreak,
                        endTime: time,
                        endDate: date,
                        status:'Completed',
                    }, 
                        {where:{id:shift.id}
                     })
                     .then(async(data)=>{
                        await ShiftTimeline.create({
                            shiftId: shift.id,
                            message: "Ended Shift"
                        })
                     })
                 }else{
     
                     // Adding existing time to the new time 
                     const totalBreak = times.addTimes([shift.totalBreak, totalBreakTime]);
                     const breakEnd =  Shift.update({
                        break:sequelize.fn('array_append', sequelize.col('break'), JSON.stringify(endBreak)), 
                        totalBreak: totalBreak,
                        endImage: endImageRoute,
                        totalShiftLength: totalShiftLength,
                        shiftWithoutBreak: shiftwithoutBreak,
                        endTime: time,
                        endDate: date,
                        status:'Completed',
                        }, 
                         {where:{id:shift.id}
                      })
                      .then(async(data)=>{
                        await ShiftTimeline.create({
                            shiftId: shift.id,
                            message: "Ended Shift"
                        })
                     })
                      return res.status(200).json({success:true, message:`Break Ended TIME: ${endBreak.end}`})
                 } 
    
            }
        });
              

        // check if the shifts break has ended
        // console.log(shift.break)

    } catch (error) {
        console.error(error);
        return res.status(500).json({success:false, message:`Something went wrong please try again later`});
    }
}

// exports.singleEmployee_get = async(req, res)=>{
//     const employee = await Employee.findOne({where:{id: req.params.employeeId, branchId:req.branchId, pin: req.body.pin}, 
//         include:[{model:Shift, order:[['createdAt','DESC']]}]
//     });
//     console.log(employee)
//     if (employee) {
//         return res.status(200).json({success:true,employee:employee});
//     }
// }