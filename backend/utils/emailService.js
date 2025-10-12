// backend/utils/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendRegistrationEmail = async (to, username) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Registration Successful - Welcome to Our Platform!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #A52A2A; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to Our Platform!</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2>Hello ${username},</h2>
            <p>Your account has been successfully registered and is now active!</p>
            <p>We're excited to have you on board. You can now access your dashboard and start exploring all the features we offer.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                 style="background: #A52A2A; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <br/>
            <p>Best regards,<br/>The Team</p>
          </div>
          <div style="background: #333; color: white; padding: 10px; text-align: center;">
            <p style="margin: 0; font-size: 12px;">
              &copy; 2024 Our Platform. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending registration email:', error);
    throw new Error('Failed to send registration email');
  }
};

module.exports = { sendRegistrationEmail };