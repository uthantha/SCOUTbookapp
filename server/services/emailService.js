const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // Check if email is configured
  if (!process.env.EMAIL_USER || 
      !process.env.EMAIL_PASSWORD || 
      process.env.EMAIL_USER === 'your_email@gmail.com' ||
      process.env.EMAIL_PASSWORD === 'your_gmail_app_password_here') {
    console.log('⚠️  Email not configured - verification codes will be logged to console');
    console.log('📝 To enable email: Follow instructions in GMAIL_SETUP_QUICK.md');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    console.log('✅ Email service configured with:', process.env.EMAIL_USER);
    return transporter;
  } catch (error) {
    console.error('❌ Error creating email transporter:', error);
    return null;
  }
};

// Send verification code email
const sendVerificationCode = async (email, code, name = 'User') => {
  const transporter = createTransporter();

  // If email not configured, just log the code
  if (!transporter) {
    console.log('📧 VERIFICATION CODE for', email, ':', code);
    console.log('⚠️  Configure email settings in .env to send actual emails');
    return { success: true, message: 'Code logged to console (email not configured)' };
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'ScoutBook - Password Reset Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f7a5a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .code-box { background: white; border: 2px solid #1f7a5a; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .code { font-size: 32px; font-weight: bold; color: #1f7a5a; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          .warning { background: #fef3c7; border-left: 4px solid #fbbf24; padding: 12px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>We received a request to reset your password for your ScoutBook account.</p>
            <p>Your verification code is:</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            
            <p>Enter this code on the password reset page to continue.</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 10px 0;">
                <li>This code expires in 10 minutes</li>
                <li>Never share this code with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <p>Best regards,<br>The ScoutBook Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} ScoutBook. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hello ${name},
      
      We received a request to reset your password for your ScoutBook account.
      
      Your verification code is: ${code}
      
      Enter this code on the password reset page to continue.
      
      This code expires in 10 minutes.
      
      If you didn't request a password reset, you can safely ignore this email.
      
      Best regards,
      The ScoutBook Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
    return { success: true, message: 'Verification code sent successfully' };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // Fallback: log the code if email fails
    console.log('📧 VERIFICATION CODE for', email, ':', code);
    return { success: false, message: 'Failed to send email, but code logged to console' };
  }
};

module.exports = {
  sendVerificationCode,
};