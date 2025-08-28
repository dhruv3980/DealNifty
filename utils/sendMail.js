import nodemailer from "nodemailer"

export const sendEMail = async(option)=>{
    const transporter =nodemailer.createTransport({
        host:process.env.HostService,
        port:process.env.HostPort,
        secure:false,

        auth:{
            user:process.env.HostUser,
            pass:process.env.HostPass
        }

    })

    const options = {
        from:"",
        to:`${option.user}`,
        subject:option.subject,
        html: `<p>${option.message}</p>`
    }

    await  transporter.sendMail(options)


}