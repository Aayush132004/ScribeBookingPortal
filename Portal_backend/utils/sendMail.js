import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// 🟢 Use explicit SMTP settings instead of 'service: gmail'
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // 🟢 Best port for cloud hosting
  secure: false, // Must be false for port 587 (it uses STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // MUST be an App Password, not login password
  },
  tls: {
    rejectUnauthorized: false, // 🟢 Fixes SSL handshake timeouts
  },
  // 🟢 Add timeouts to prevent hanging
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

export const sendMail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Scribe Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Email Failed:", error.message);
    // 🟢 Critical: We throw the error so the Controller knows it failed
    throw error;
  }
};