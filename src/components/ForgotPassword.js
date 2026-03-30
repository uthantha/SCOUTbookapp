import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/forgot-password.css';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      setMessage(response.message);
      setStep(2);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to send verification code';
      setError(errorMsg);
      
      // If it's a Google user without password, show helpful message
      if (errorMsg.includes('Google')) {
        setMessage('Tip: You can set a password for your Google account to enable email/password login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authAPI.verifyResetCode(email, code);
      setResetToken(response.resetToken);
      setMessage('Code verified! Please enter your new password.');
      setStep(3);
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(resetToken, newPassword);
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page container">
      <div className="forgot-password-card">
        <h2>Reset Password</h2>
        
        {/* Progress Indicator */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Email</div>
          </div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Code</div>
          </div>
          <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">New Password</div>
          </div>
        </div>

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="reset-form">
            <p className="description">
              Enter your email address and we'll send you a verification code to reset your password.
            </p>
            
            <label>Email Address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoFocus
              />
            </label>

            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}

            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>

            <button 
              type="button" 
              className="btn secondary" 
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Step 2: Enter Verification Code */}
        {step === 2 && (
          <form onSubmit={handleCodeSubmit} className="reset-form">
            <p className="description">
              We've sent a 6-digit verification code to <strong>{email}</strong>. 
              Please enter it below.
            </p>
            
            <label>Verification Code
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength="6"
                required
                autoFocus
                className="code-input"
              />
            </label>

            <p className="hint">Check your email inbox and spam folder</p>

            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}

            <button className="btn primary" type="submit" disabled={loading || code.length !== 6}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button 
              type="button" 
              className="btn secondary" 
              onClick={() => setStep(1)}
            >
              Change Email
            </button>
          </form>
        )}

        {/* Step 3: Enter New Password */}
        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="reset-form">
            <p className="description">
              Create a new password for your account.
            </p>
            
            <label>New Password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
                autoFocus
              />
            </label>

            <label>Confirm New Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </label>

            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}

            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}