import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import GoogleLogin from './GoogleLogin';
import '../styles/signin.css';

export default function SignIn({ onSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('player');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password || !confirmPassword || !role) {
      setError('Please fill all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.signup({ email, password, role });
      
      // Store token and user data
      localStorage.setItem('sb_token', response.token);
      localStorage.setItem('sb_user', JSON.stringify(response.user));
      
      // Update app state
      onSignup(response.user);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page container">
      <div className="signin-card">
        <h2>Create your ScoutBook account</h2>
        <p className="muted">Sign up as Player or Scout</p>

        <form onSubmit={handleSubmit} className="signin-form">
          <label>Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </label>
          <label>Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password (min 6 characters)"
              required
            />
          </label>
          <label>Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </label>
          <label>I am a
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="player">Player</option>
              <option value="scout">Scout</option>
            </select>
          </label>

          {error && <div className="error">{error}</div>}

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <GoogleLogin 
          onSuccess={(user) => {
            onSignup(user);
            navigate('/dashboard');
          }}
          onError={(error) => setError(error)}
        />

        <div className="back-to-login">
          <p>Already have an account?</p>
          <button
            className="btn secondary"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
