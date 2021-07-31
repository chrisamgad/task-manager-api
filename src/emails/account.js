const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY) //go to dev.env to see variable value

const sendWelcomeEmail = (email,name) =>{
    sgMail.send({
        to: email,
        from: 'chrisamgad@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancellationEmail =(email,name)=>{
    sgMail.send({
        to:email,
        from:'chrisamgad@gmail.com',
        subject:'Cancellation Confirmed',
        text:`We would appreciate it Mr.${name} if you could let us know why to cancelled your subscribtion`
    })
}

module.exports ={
    sendWelcomeEmail:sendWelcomeEmail,
    sendCancellationEmail:sendCancellationEmail
}