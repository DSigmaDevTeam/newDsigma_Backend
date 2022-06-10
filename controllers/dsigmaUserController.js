const DsUser = require('../models/dsigma/dsigmaUser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register_post = async(req, res)=>{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
            await DsUser.create({
            email: req.body.email,
            password: hashedPassword,
            isAdmin: true 
        });
        return res.status(200).json({success: true, message:`User has been successfully registered`})
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message:`Something went wrong, Please try again later`});
    }
}

