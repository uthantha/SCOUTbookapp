const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const passport = require('../config/passport');
const pool = require('../config/database');
const User = require('../models/User');
const Profile = require('../models/Profile');
const PasswordReset = require('../models/PasswordReset');
const { sendVerificationCode } = require('../services/emailService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const signupValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['player', 'scout']).withMessage('Role must be either player or scout')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

// Generate JWT token
const generateToken = (userId, expiresIn = '7d') => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
};

// POST /api/auth/signup
router.post('/signup', signupValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password, role } = req.body;

    // Create user
    const user = await User.create({ email, password, role });
    
    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: null,
        profile_picture: null
      },
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.message === 'Email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Validate password
    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last_login timestamp
    await User.updateLastLogin(user.id);

    // Generate token
    const token = generateToken(user.id);

    // Fetch profile data
    const profile = await Profile.findByUserId(user.id);
    
    console.log('🔍 Login - User from DB:', { id: user.id, name: user.name, picture: user.profile_picture });
    console.log('🔍 Login - Profile from DB:', profile ? { full_name: profile.full_name, picture: profile.profile_picture } : 'No profile');

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: profile?.full_name || user.name || null,
        profile_picture: profile?.profile_picture || user.profile_picture || null
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // Fetch profile data
    const profile = await Profile.findByUserId(req.user.id);
    
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        name: profile?.full_name || req.user.name || null,
        profile_picture: profile?.profile_picture || req.user.profile_picture || null
      }
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name || null,
        profile_picture: req.user.profile_picture || null
      }
    });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  // In a real app, you might want to blacklist the token
  res.json({ message: 'Logout successful' });
});

// Google OAuth Routes
// GET /api/auth/google - Start Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// GET /api/auth/google/callback - Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // For new users, redirect to role selection
      // For existing users, complete login
      if (req.user.role) {
        // Existing user with role - complete login
        const token = generateToken(req.user.id);
        // Don't pass profile picture in URL (causes 431 error if too large)
        res.redirect(`http://localhost:3000/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          name: req.user.name,
          auth_provider: req.user.auth_provider
        }))}`);
      } else {
        // New user without role - redirect to role selection
        const tempToken = generateToken(req.user.id, '10m'); // Short-lived token
        res.redirect(`http://localhost:3000/role-selection?temp_token=${tempToken}&user=${encodeURIComponent(JSON.stringify({
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          auth_provider: req.user.auth_provider
        }))}`);
      }
    } catch (error) {
      console.error('❌ Google callback error:', error);
      res.redirect('http://localhost:3000/login?error=auth_failed');
    }
  }
);

// POST /api/auth/google/complete - Complete Google OAuth with role selection
router.post('/google/complete', async (req, res) => {
  try {
    const { temp_token, role, password } = req.body;
    
    if (!temp_token || !role) {
      return res.status(400).json({ error: 'Missing temp_token or role' });
    }

    if (!['player', 'scout'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Verify temp token
    const decoded = jwt.verify(temp_token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const bcrypt = require('bcryptjs');
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update user with selected role and optional password
    const updateQuery = hashedPassword 
      ? `UPDATE users 
         SET role = $1, password = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING id, email, role, name, profile_picture, auth_provider, created_at`
      : `UPDATE users 
         SET role = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, email, role, name, profile_picture, auth_provider, created_at`;
    
    const params = hashedPassword ? [role, hashedPassword, user.id] : [role, user.id];
    const result = await pool.query(updateQuery, params);
    const updatedUser = result.rows[0];

    // Generate final token
    const finalToken = generateToken(updatedUser.id);

    res.json({
      message: password 
        ? 'Google authentication completed with password set' 
        : 'Google authentication completed successfully',
      user: updatedUser,
      token: finalToken
    });

  } catch (error) {
    console.error('❌ Google complete error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/google/url - Get Google OAuth URL for frontend
router.get('/google/url', (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&` +
    `response_type=code&` +
    `scope=profile email&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  res.json({ url: googleAuthUrl });
});

// GET /api/auth/google/status - Check if Google OAuth is configured
router.get('/google/status', (req, res) => {
  const isConfigured = process.env.GOOGLE_CLIENT_ID && 
                       process.env.GOOGLE_CLIENT_SECRET && 
                       process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here';
  
  res.json({ 
    configured: isConfigured,
    message: isConfigured ? 'Google OAuth is configured' : 'Google OAuth credentials not set'
  });
});

// Password Reset Routes

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If the email exists, a verification code has been sent' });
    }

    // Generate verification code (allow all users including Google users)
    const code = PasswordReset.generateCode();
    
    // Save code to database
    await PasswordReset.createResetCode(email, code);

    // Send email
    await sendVerificationCode(email, code, user.name || 'User');

    res.json({ 
      message: 'Verification code sent to your email',
      email: email // Send back for frontend to use
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/verify-reset-code - Verify the reset code
router.post('/verify-reset-code', [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid email or code' });
    }

    const { email, code } = req.body;

    // Verify code
    const resetRecord = await PasswordReset.verifyCode(email, code);
    
    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Generate temporary token for password reset
    const resetToken = jwt.sign(
      { email, resetId: resetRecord.id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ 
      message: 'Code verified successfully',
      resetToken
    });

  } catch (error) {
    console.error('❌ Verify code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/reset-password - Reset password with verified code
router.post('/reset-password', [
  body('resetToken').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid data provided' });
    }

    const { resetToken, newPassword } = req.body;

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const { email, resetId } = decoded;

    // Mark code as used
    await PasswordReset.markAsUsed(resetId);

    // Update user password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateQuery = `
      UPDATE users 
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE email = $2
      RETURNING id, email, role
    `;

    const result = await pool.query(updateQuery, [hashedPassword, email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Password reset successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;