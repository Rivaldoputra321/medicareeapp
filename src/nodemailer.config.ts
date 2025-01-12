import * as nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,         // e.g., smtp.gmail.com
  port: +process.env.SMTP_PORT || 587, // Default port for TLS
  secure: false,                       // Set to `true` if using port 465
  auth: {
    user: process.env.SMTP_USER,       // Your email address
    pass: process.env.SMTP_PASSWORD,   // Your email password or app password
  },
});
