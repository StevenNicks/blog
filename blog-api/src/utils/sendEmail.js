const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    requireTLS: Number(process.env.SMTP_PORT) !== 465, // Outlook usa STARTTLS en el 587
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
};

// Sin SMTP configurado (desarrollo) el correo se imprime en consola.
const sendEmail = async ({ to, subject, text, html, attachments }) => {
  if (!process.env.SMTP_HOST) {
    console.log(`\n[email simulado] Para: ${to}\nAsunto: ${subject}\n${text}\n`);
    return false;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
      attachments,
    });
    return true;
  } catch (err) {
    if (process.env.NODE_ENV === 'production') throw err;
    console.warn(`\n[email] SMTP falló (${err.message}). Solo en desarrollo se imprime el correo:`);
    console.log(`Para: ${to}\nAsunto: ${subject}\n${text}\n`);
    return false;
  }
};

module.exports = sendEmail;
