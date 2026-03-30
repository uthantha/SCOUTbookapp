// Test email configuration
require('dotenv').config();
const { sendVerificationCode } = require('./services/emailService');

const testEmail = async () => {
  console.log('🧪 Testing Email Configuration...\n');
  
  console.log('Configuration:');
  console.log('- Email Host:', process.env.EMAIL_HOST);
  console.log('- Email Port:', process.env.EMAIL_PORT);
  console.log('- Email User:', process.env.EMAIL_USER);
  console.log('- Email Password:', process.env.EMAIL_PASSWORD ? '***configured***' : '❌ NOT SET');
  console.log('- Email From:', process.env.EMAIL_FROM);
  console.log('');

  // Test email address (change this to your email)
  const testEmailAddress = process.env.EMAIL_USER || 'test@example.com';
  const testCode = '123456';

  console.log(`📧 Sending test email to: ${testEmailAddress}`);
  console.log(`🔢 Test code: ${testCode}\n`);

  try {
    const result = await sendVerificationCode(testEmailAddress, testCode, 'Test User');
    
    if (result.success) {
      console.log('✅ SUCCESS! Email sent successfully!');
      console.log('📬 Check your inbox:', testEmailAddress);
      console.log('📁 Also check spam/junk folder');
    } else {
      console.log('⚠️  Email service not configured or failed');
      console.log('💡 Check GMAIL_SETUP_QUICK.md for setup instructions');
    }
  } catch (error) {
    console.error('❌ Error sending test email:', error.message);
    console.log('\n💡 Common issues:');
    console.log('1. Make sure 2FA is enabled on your Gmail');
    console.log('2. Use App Password, not regular password');
    console.log('3. Check EMAIL_USER and EMAIL_PASSWORD in .env');
    console.log('4. Remove spaces from app password');
  }
};

testEmail();