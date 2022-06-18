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

// Kiosk Login
exports.login_post = async(req,res)=>{
    try {
        // console.log(req.body)
        const branch = await Branch.findOne({where:{kioskId:req.body.companyId, code:req.body.code}});
        // console.log(branch)
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

// Dashboard
exports.dashboard_get = async(req, res) => {
    try {
        // fetching all employees
        const employees = await Employee.findAll({where:{branchId: req.branchId}, 
            order:[['createdAt', 'DESC']],
        attributes: ['email','createdAt', 'id','shiftStatus'], 
        include: [ 
            {
             model: Flag, 
             where:{flag:'Active'}, attributes: ['flag']
            },
            {model:EmployeeDetails, attributes:['fname', 'lname', 'mobNumber', 'title']},
            {model: Shift, include:[{model: ShiftTimeline}]},
        ]
    });
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

// Employee Login
exports.employeeLogin_post = async(req, res) => {
    try {
        // console.log(req.params.employeeId)
        // console.log(req.branchId)
        // console.log(req.body.pin)
        const employee = await Employee.findOne({where:{id: req.params.employeeId, branchId:req.branchId, pin: req.body.pin},
            attributes:{exclude:['password']}, 
            include:[{model:EmployeeDetails}]
        });
        console.log(employee)
        // let shift = "N/A";
        let shift = await Shift.findOne({where:{employeeId:employee.id, status:"Active"}})
        if(!shift){
            shift = "N/A";
        }
        // console.log(employee)
        if (employee) {
            const key = process.env.ACCESS_TOKEN_SECRET;
                const accessToken = jwt.sign({user:employee.email}, key,{
                    expiresIn: '30d'
                });           
            return res.status(200).json({success:true, message:`Login Successful`,employee:employee, accessToken:accessToken, shift:shift});
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


// StartShift
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
            console.log(req.file)
            if(req.file) {

                const employee = Employee.findOne({where:{email:req.user}})
                .then(async(employee)=>{
                    const shiftStart = Shift.create({
                        startTime: date_ob.toISOString(),
                        startDate: date_ob.toISOString(),
                        startImage: req.file.location,
                        employeeId: employee.id,
                        status:`Active`,
                        totalBreak: `00:00:00`
                    }).then(async (shift)=>{
                        await ShiftTimeline.create({
                            shiftId: shift.id,
                            message:"Started Shift"
                        });
                        await Employee.update({shiftStatus:"Working"},{where:{id:employee.id}})
                        return res.status(200).json({success:true, message:`Successfully started a shift`, startImage: req.file.location, startTime: date_ob.toISOString(), shift:shift});
                    })

                }).catch((err)=>{
                    console.log(err);
                    return res.status(500).json({success:false, message:`Something went wrong Please try again later`})
                })  
            } else{
                const employee = Employee.findOne({where:{email:req.user}})
                .then(async(employee)=>{
                    const shiftStart = Shift.create({
                        startTime: date_ob.toISOString(),
                        startDate: date_ob.toISOString(),
                        startImage: "N/A",
                        employeeId: employee.id,
                        status:`Active`,
                        totalBreak: `00:00:00`
                    }).then(async(shift)=>{
                        await ShiftTimeline.create({
                            shiftId: shift.id,
                            message:"Started Shift"
                        })
                        await Employee.update({shiftStatus: "Working"}, {where:{id: employee.id}})
                        return res.status(200).json({success:true, message:`Successfully started a shift`, startImage:"N/A", startTime: date_ob.toISOString(), shift:shift });
                    })
                }).catch((err)=>{
                    console.log(err);
                    return res.status(500).json({success:false, message:`Something went wrong Please try again later`})
                })  
            }
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
                const startBreak = {"start":date_ob.toISOString(), "end":""}
                // Updating Shift
            const sh = await Shift.update({break: sequelize.fn('array_append', sequelize.col('break'), JSON.stringify(startBreak))} ,{where:{id:shift.id}})
                // Updating Shift Status
            await Employee.update({shiftStatus:"On Break"},{where:{id:employee.id}});
            // .then(async(data)=>{
            // });
            const sendShift = await Shift.findOne({where:{id: shift.id}});
            console.log(sendShift)
            return res.status(200).json({success:true, message:`Successfully started a break`, startTime: date_ob.toISOString(), shift:sendShift});
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
            const position = shift.break.length -1
            if(shift.break[position].end){
                return res.status(400).json({success:false, message:`Shift has already ended`});
            }

            //Ending Break
            const endBreak = {"end": date_ob.toISOString()}
            const totalBreakTime = times.breakTimeCalculator(shift.break[position].start, date_ob.toISOString());
          

            // Check if the totalBreakTime in DB is not === 00:00:00
            // console.log(ba.break[positions])
            // console.log(g)
            if(shift.totalBreak === `00:00:00`){
                var ba =  await Shift.findOne({where:{id:shift.id}});
                const positions = ba.break.length -1
                ba.break[positions]['end'] = date_ob.toISOString();
                const g = await Shift.update({break: ba.break, totalBreak:totalBreakTime},{where:{id:shift.id}});
                         await Employee.update({shiftStatus:"Working"}, {where:{id:employeeWithActiveShift.id}});
                // Shift.findOne({where:{id:shift.id}}).then(async(result)=>{
                //     if(result){
                //         console.log(result.break[position])
                //         result.break[position].end = date_ob.toISOString()
                //         // result.break[position].save();
                //         await result.reload()
                //         // await Employee.update({shiftStatus:"Working"}, {where:{id:employeeWithActiveShift.id}});

                //     }
                // })
                // const sa = await Shift.findOne({where:{id:shift.id}});
                // sa.break[position].end = date_ob.toISOString()

            //    const breakEnd =   Shift.update({
            //        break:sequelize.fn('array_append', sequelize.col('break'), JSON.stringify(endBreak)), 
            //        totalBreak: totalBreakTime}, 
            //        {where:{id:shift.id}
            //     })
            //     .then(async(data)=>{
            //     })
                const endedShift = await Shift.findOne({where:{id:employeeWithActiveShift.shifts[0].id}})
                // console.log(endedShift.toJSON());
                return res.status(200).json({success:true, message:`Successfully ended a break!`, endTime: date_ob.toISOString(), shift:endedShift})
            }else{

                // Adding existing time to the new time 
                const totalBreak = addTimes(shift.totalBreak, totalBreakTime);
                console.log(totalBreak)
                var baz =  await Shift.findOne({where:{id:shift.id}});
                const positions = baz.break.length -1
                baz.break[positions]['end'] = date_ob.toISOString();
                const g = await Shift.update({break: baz.break, totalBreak:totalBreak},{where:{id:shift.id}});
                         await Employee.update({shiftStatus:"Working"}, {where:{id:employeeWithActiveShift.id}});

                const endedShift = await Shift.findOne({where:{id:employeeWithActiveShift.shifts[0].id}});
                console.log(endedShift);
                return res.status(200).json({success:true, message:`Successfully ended a break!`, endTime: date_ob.toISOString(), shift:endedShift});
            } 
            
        }else{
            return res.status(400).json({success:false, message:`No Active shifts exists`});
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({success:false, message:`Error: error: ${error.message}`})
    }
}

// End Shift
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

        // check if the employee with ACTIVE shift Exists
        const employeeWithActiveShift = await Employee.findOne({where:{email:req.user}, include:[{
            model:Shift, 
            where:{status:'Active'}
        }]});
        // If exists returning error
        if(!employeeWithActiveShift){
            return res.status(400).json({success:false, message:`Employee has no Active shifts`})
        }
        
        // fetching Shift
        const shift = await Shift.findOne({where:{id: employeeWithActiveShift.shifts[0].id}});
        let position = ""
        if(shift.break !== null){
            position = shift.break.length -1
        }
        const startDate = new Date(shift.startTime);
        const endDate = date_ob;
        const msec =  Math.abs( endDate - startDate );
        const totalShiftTime = new Date(msec).toISOString()
        // console.log(totalShiftTime)
        // console.log(typeof(totalShiftTime))
        const t = `${new Date(totalShiftTime).getUTCHours()}:${new Date(totalShiftTime).getUTCMinutes()}:${new Date(totalShiftTime).getUTCSeconds()}`
        // const t = Math.abs(new Date(totalShiftTime) - new Date(shift.totalBreak))
        const shiftWithoutBreak = times.breakTimeCalculator(t, shift.totalBreak)
        console.log(shiftWithoutBreak)

        const uploadSingle = upload("dsigmas3").single(
            "EndShiftImage"
          );
        uploadSingle(req,res, async(err)=>{
            if(err){
                console.log(err)
                return res.status(400).json({success:false, message: `Error while uploading the Image to aws ERROR:${err.message}`});
            }
            // console.log(req.file)
            // Checking if the image is sent
            if(req.file){
                var endImageRoute = req.file.location
            }else{
                var endImageRoute = "N/A"
            }
            if(shift.break == null || shift.break[position].end){
                // Ending Shift
                 Shift.update({
                    endTime: date_ob.toISOString(),
                    endDate: date_ob.toISOString(),
                    totalShiftLength: totalShiftTime,
                    shiftWithoutBreak: shiftWithoutBreak,
                    endImage: endImageRoute,
                    status: 'Completed'
                }, {where:{id: shift.id}})
                .then(async(data)=>{
                    // Adding Shift Timeline
                    await ShiftTimeline.create({
                        shiftId: shift.id,
                        message: "Ended Shift"
                    });
                    // Updating ShiftStatus
                    await Employee.update({shiftStatus: "Not Working"}, {where:{id: employeeWithActiveShift.id}})
                });
                return res.status(200).json({success: true, message:`Successfully ended a shift!`, endShiftImage:endImageRoute, endShiftTime: date_ob.toISOString() });
            }else{
                // Calculate the total time
                // check if the total time in db is 00:00:00
                // const endBreak = {"end": date_ob.toISOString()}
                const totalBreakTime = times.breakTimeCalculator(shift.break[position].start, date_ob.toISOString())
                // const totalBreakTime = times.breakTimeCalculator(shift.break[position].start, time);
                const shiftwithoutBreak = times.breakTimeCalculator(totalShiftTime, totalBreakTime)
    
            
                if(shift.totalBreak === `00:00:00`){
                    // Ending shift

                    var brk =  await Shift.findOne({where:{id:shift.id}});
                    const positions = brk.break.length -1
                    brk.break[positions]['end'] = date_ob.toISOString();

                    const breakEnd = Shift.update({
                        break:brk.break, 
                        totalBreak: totalBreakTime,
                        endImage: endImageRoute,
                        totalShiftLength: totalShiftTime,
                        shiftWithoutBreak: shiftwithoutBreak,
                        endTime: date_ob.toISOString(),
                        endDate: date_ob.toISOString(),
                        status:'Completed',
                    }, 
                        {where:{id:shift.id}
                     })
                     .then(async(data)=>{
                        // Adding Shift Timeline
                        await ShiftTimeline.create({
                            shiftId: shift.id,
                            message: "Ended Shift"
                        });
                        // Updating Shift Status
                        await Employee.update({shiftStatus: "Not Working"}, {where:{id: employeeWithActiveShift.id}});
                     })
                     return res.status(200).json({success:true, message:`Successfully ended shift!`, endShiftImage:endImageRoute, endShiftTime: date_ob.toISOString()})

                 }else{
     
                     // Adding existing time to the new time 
                    //  const totalBreak = times.addTimes([shift.totalBreak, totalBreakTime]);
                    const totalBreak = times.breakTimeCalculator(shift.break[position].start, date_ob.toISOString())
                    const shiftWithoutBreaks = times.breakTimeCalculator(t, shift.totalBreak)
                    // const totalBreak = new Date(shift.totalBreak) + new Date(totalBreakTime);

                     var brek =  await Shift.findOne({where:{id:shift.id}});
                    const positions = brek.break.length -1
                    brek.break[positions]['end'] = date_ob.toISOString();

                     const breakEnd =  Shift.update({
                        break:brek.break, 
                        totalBreak: totalBreak,
                        endImage: endImageRoute,
                        totalShiftLength: totalShiftTime,
                        shiftWithoutBreak: shiftWithoutBreaks,
                        endTime: date_ob.toISOString(),
                        endDate: date_ob.toISOString(),
                        status:'Completed',
                        }, 
                         {where:{id:shift.id}
                      })
                      .then(async(data)=>{
                        await ShiftTimeline.create({
                            shiftId: shift.id,
                            message: "Ended Shift"
                        });
                        await Employee.update({shiftStatus:"Not Working"},{where:{id:employeeWithActiveShift.id}});
                     })
                      return res.status(200).json({success:true, message:`Successfully ended shift!`, endShiftImage:endImageRoute, endShiftTime: date_ob.toISOString()})
                 } 
    
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({success:false, message:`Something went wrong please try again later`});
    }
}

