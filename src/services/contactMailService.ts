import nodemailer from "nodemailer";

const sendContactMail = async (
  name: string,
  email: string,
  subject: string,
  message: string
) => {
  const MAIL_USER = process.env.MAIL_USER;
  const MAIL_PASS = process.env.MAIL_PASS;
  const MAIL_HOST = process.env.MAIL_HOST;
  const SMTP_PORT = <number>(<unknown>process.env.SMTP_PORT);

  const transport = nodemailer.createTransport({
    host: MAIL_HOST,
    port: SMTP_PORT,
    tls: {
      ciphers: "SSLv3"
    },
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS
    },
    secure: false
  });

  const mailOptions = {
    from: `${name}> ${email} <${MAIL_USER}>`,
    to: MAIL_USER,
    subject: subject,
    html: `<p> ${message} </p>`
  };

  try {
    const deliverMail = await transport.sendMail(mailOptions);
    return deliverMail;
  } catch (error) {
    throw new Error(error.message);
  }
};

export default sendContactMail;
