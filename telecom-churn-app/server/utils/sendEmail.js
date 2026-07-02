const nodemailer = require('nodemailer');


const sendEmail = async (options) => {
  const config = {};

  // If using Gmail, use Nodemailer's built-in Gmail service configuration for speed and reliability
  if (process.env.SMTP_HOST && (process.env.SMTP_HOST.includes('gmail') || process.env.SMTP_MAIL.includes('gmail'))) {
    config.service = 'gmail';
  } else {
    config.host = process.env.SMTP_HOST;
    config.port = parseInt(process.env.SMTP_PORT || '587', 10);
    config.secure = process.env.SMTP_SECURE === 'true';
  }

  config.auth = {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD
  };

  // Prevent local TLS/certificate handshake issues
  config.tls = {
    rejectUnauthorized: false
  };

  const transporter = nodemailer.createTransport(config);

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'ChurnPredict AI'}" <${process.env.SMTP_MAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
