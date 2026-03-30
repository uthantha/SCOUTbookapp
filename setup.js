const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up ScoutBook...\n');

// Install frontend dependencies
console.log('📦 Installing frontend dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies:', error.message);
  process.exit(1);
}

// Install backend dependencies
console.log('📦 Installing backend dependencies...');
try {
  execSync('npm install', { cwd: 'server', stdio: 'inherit' });
  console.log('✅ Backend dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install backend dependencies:', error.message);
  process.exit(1);
}

// Check if .env exists
const envPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  Please configure your database settings in server/.env');
  console.log('   Copy the example values and update with your PostgreSQL credentials\n');
}

console.log('🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Configure your PostgreSQL database');
console.log('2. Update server/.env with your database credentials');
console.log('3. Run "cd server && npm run dev" to start the backend');
console.log('4. Run "npm start" to start the frontend');
console.log('\nHappy coding! 🚀');