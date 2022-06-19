const SENDER_EMAIL = process.env.SENDER_EMAIL
 
 function inviteOutput(email){
    var data = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dsigma Email</title>
    </head>
    <body style="background-color: rgb(201, 201, 201);">
        <header>
            
        </header>
    
    <table style="margin: auto; background-color: white;">
        <tbody>
            <tr>
                <td id="logo" style="display:block; text-align: center;">
                    <img src="https://i.im.ge/2022/06/19/re2zMa.png" alt="Crinitis logo" width="150px">
                </td>
            </tr>
            <tr>
                <th style="font-size:20px; padding: 10px;">Hi ${email}</th>
            </tr>
            <tr>
                <td style="text-align:center;">You have been invited by <strong>Hardik Pokiya</strong> to join Criniti's</td>
            </tr>
    
            <tr style="text-align: center;">
                    <td>
                        <table style="text-align: center; margin: auto; border: 3px solid;">
                            <tr>
                            <th style="padding: 10px; font-size:20px" >
                                New to Dashify? 
                             </th>
                            </tr>
                            <tr>
                             <td style="text-align:center;">
                                 If you don't have an account please
                             </td>
                            </tr>
                            <tr>
                             <td style="text-align:center; padding: 10px;">
                            <a href="https://dsigma.net">
                             <button style="background-color:black; color:white; padding: 5px; border-radius: 5px;">Register Now</button>
                            </a> 
                            </td>
                            </tr>
                        </table>
                    </td>
            </tr>
    
            <tr>
                <td style="text-align:center; padding: 10px;">NEED HELP?</td>
            </tr>
            <tr>
                <td style="text-align:center; padding: 10px">Please click the <u>"Sign Up"</u>. tab to create your account once you click the register link provided.</td>
            </tr>
            <tr>
                <td style="text-align:center; padding: 10px">Having troubles creating an account or signing in, please contact the Dashify<br>team by email, <u>support@dashify.com.au</u>, our team will gladly assit you.</td>
            </tr>
            <tr>
                <td style="text-align:center; padding: 15px"><img src="https://dsigma.net/assets/images/dsigma-logo.png" alt="Dsigma logo" width="100px"></td>
            </tr>
            <tr>
                <td style="text-align:center;"><strong>DSigma PYT Ltd.</strong></td>
            </tr>
            <tr>
                <td style="text-align:center;">Restaurant & Business Management Software</td>
            </tr>    
            <tr>    
                <td style="text-align:center;">Learn how you can simplify and transform your business today!</td>
            </tr>
        </tbody>   
    </table>
    
    </body>
    </html>
`
    return JSON.stringify(data);
    
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
