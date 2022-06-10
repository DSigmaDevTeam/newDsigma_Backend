require('dotenv').config();
const jwt = require('jsonwebtoken');
const  JWT_SECRET  = process.env.ACCESS_TOKEN_SECRET;
const DsUser = require('../models/dsigma/dsigmaUser');

module.exports = async(req, res, next) => {
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).json({ message: "You must be logged in" })
    }
    const token = authorization.replace("Bearer ", "")
    jwt.verify(token, JWT_SECRET, async(err, payload) => {
        try {
            if (err) {
                return res.status(401).json({ message: "You must be logged in" })
            }
            const { user } = payload
            const admin = await DsUser.findOne({where:{email:user}})
            // .then(userData => {
            //     req.user = userData.email
            //     next()
            // });
            if(admin && admin.isAdmin == true){
                req.user = admin.email
                next();
            }else{
                console.log(`from isAdmin Middleware ${admin}`);
                return res.status(500).json({success:false, message: `Not Authorized`});
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({success:false, message:`isAdmin ERROR: ${error.message}`})
        }
    })
}