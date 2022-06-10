const SENDER_EMAIL = process.env.SENDER_EMAIL
 
 function inviteOutput(email){
    return {
        from: `Hardik Pokiya <SENDER_EMAIL>`,
        to: email,
        subject: `Register Invitation from Dsigma`,
        text:`
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body style="  background-color: lightgray;">
       <div style="display: flex; justify-content: center; flex-direction: column; text-align:center;  background-color: rgb(255, 255, 255); margin: auto; width: 600px;">
        <div  style="display: flex; justify-content: space-between; align-items: center; background-color: black; width: 600px;">
            <div><img src="/mail/img/crinitis.png"  height="50px" width="55px" alt="logo"></div>
            <div style="vertical-align: middle; margin-left: auto;  color: white; font-size: 1.5rem; font-family: 'Courier New', Courier, monospace;">Criniti's</div>
            <div style="margin-left: auto;"><img src="/mail/img/dsigma-logo.png"  height="50px"  alt="DSigma"></div>
        </div>
        <div style="display: flex; flex-direction: column; margin: 30;">
            <h1 style="padding: 0; margin: 0; text-align: center;">Hi</h1>
            <h1 style="padding: 0; margin: 0; text-align: center;" id="email">mrxyz@gmail.com</h1>
            <h1 style="padding: 0; margin: 0; text-align: center;">👋,</h1> 
            <p>You have been invited by Hardik Pokiya (<a href="mailto:hardik.pokiya@crinitis.com.au">hardik.pokiya@crinitis.com.au</a>) to join Criniti's</p>
            <h2>Criniti's</h2>
            <a href="https://www.google.com/maps/search/645+Freshwater+Place,+Southbank,+%0D%0A+VIC,+Australia,+3006?entry=gmail&source=g">645 Freshwater Place, Southbank,<br>VIC, Australia, 3006</a>
            <div style="display: flex; flex-direction: row; justify-content: space-around; padding: 20px;">
                <div style="width: 30%; background-color: #f7f7f7; padding: 5px;">
                    <h3>Register</h3>
                    <h4>New to Dashify? If you don't have an account please <a href="#">register here</a></h4>
                </div>
                <div style="width: 30%; background-color: #f7f7f7; padding: 10px;">
                    <h3>Help</h3>
                    <h4>Please click the "Sign Up" tab to create your account once you click the register link provided.</h4>
                </div>
            </div>
            <h4>Having troubles creating an account or signing in, please contact the Dashify team by email, <a href="mailto: support@dashify.com.au">support@dashify.com.au</a>, our team will gladly assist you.</h4>
        </div>
       
       </div>
       <div style="display: flex; justify-content: center; padding-top: 5px; flex-direction: column; text-align: center; align-items: center;">
        <img src="/mail/img/footer.png" alt="" width="200px">
        <p style="margin: 0"><strong>DSigma PYT LTD.</strong></p>
        <p style="margin: 5px">Restaurant & Business Management Software</p>
        <p style="margin: 0">Learn how you can simplify and transform your business today!</p>
       </div>
    </body>
    </html>
    `} 
    
}

function onboardingOutput(details){
    const output = `
    <h1>New Entry</h1>
    <p>Details of the Invited employee</p>
    <br>
    <p>Title: ${details.title} </p>
    <p>Name: ${details.fname} </p>
    <p>Work Email: ${details.workEmail} </p>
    <p>Personal Email: ${details.personalEmail} </p>
    <p>Mobile No. : ${details.mobileNumber} </p>
    <p>D.O.B: ${details.DOB} </p>
    <p>Marital Status: ${details.maritalStatus} </p>
    <p>Gender: ${details.gender} </p>
    <p>medicare Number: ${details.medicareNumber} </p>
    <p>Drivers License: ${details.driversLicense} </p>
    <p>Passport Number: ${details.passportNumber} </p>
    <p>Bank Name: ${details.bankName} </p>
    <p>Account Number: ${details.accountNumber} </p>
    <p>Tax File Number: ${details.taxFileNumber} </p>
    <p>Working Rights: ${details.workingRights} </p>
    <p>LinkedIn: ${details.linkedIn} </p>
    <p>Facebook: ${details.facebook} </p>
    <p>address: ${details.address} </p>
    <p>Secondary Address: ${details.address2} </p>
    <p>City: ${details.city} </p>
    <p>State: ${details.state} </p>
    <p>Post Code: ${details.postCode} </p>
    <p>Country: ${details.country} </p>
    <p>Pin Code: ${details.pinCode} </p>
    `;
    return output
}

function activationOutput(pin, email){
    return {
        from :  `Hardik Pokiya <${SENDER_EMAIL}>`,
        to: email,
        subject: `Activation Mail `,
        text: `
        Your Dsigma account has been activated. Here's your kiosk pin ${pin}
        `
    }
}
module.exports = {
    inviteOutput,
    onboardingOutput,
    activationOutput
}
