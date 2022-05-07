import nodemailer from 'nodemailer'
import handlebars from 'handlebars'
import {mailVariables} from '../../@typings'
import fs from 'fs'
import path from 'path'
/**
     * 
     * @param email 
     * @param link
     */

const sendMail = async (email: string, subject:string, variables:mailVariables, template: string) => {

    const MAIL_USER = process.env.MAIL_USER
    const MAIL_PASS = process.env.MAIL_PASS
    const MAIL_HOST = process.env.MAIL_HOST
    const SMTP_PORT = <number><unknown>process.env.SMTP_PORT
    
    const transport = nodemailer.createTransport({
        host: MAIL_HOST,
        port: SMTP_PORT,
        tls: {
            ciphers: 'SSLv3'
        },
        auth: {
            user: MAIL_USER,
            pass: MAIL_PASS
        },
        // secureConnection: false,
    })

    const source = fs.readFileSync(path.join(__dirname, '../' + template), "utf8");
    const compiledTemplate = handlebars.compile(source);

    const mailOptions = {
        from: `GmartPay <${MAIL_USER}>`,
        to: email,
        subject: subject,
        html: compiledTemplate(variables)
    };

    try {
        
        const deliverEmail = transport.sendMail(mailOptions);
        return deliverEmail

    } catch (error) {
        throw new Error(error.message);
    }




}

export default sendMail