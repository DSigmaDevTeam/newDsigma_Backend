const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  //   host: "smtp.gmail.com",
  service: "gmail",
  port: 587,
  auth: {
    user: "dev.dsigma@gmail.com",
    pass: "Dev@DSigma2022",
  },
});

exports.transporter =  transporter;