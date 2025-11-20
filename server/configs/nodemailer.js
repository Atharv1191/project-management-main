const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
const sendEmail = async({to,subject,body})=>{
    const response = await transporter.sendMail({
        from:process.env.SENDER_EMAIL,
        to,
        subject,
        html:body


    })
    return response
  

}


module.exports = sendEmail