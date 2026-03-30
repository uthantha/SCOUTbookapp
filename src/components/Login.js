import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import GoogleLogin from './GoogleLogin';
import '../styles/login.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.login({ email, password });
      
      console.log('Login response:', response); // Debug log
      
      // Store token and user data
      localStorage.setItem('sb_token', response.token);
      localStorage.setItem('sb_user', JSON.stringify(response.user));
      
      console.log('Stored user data:', response.user); // Debug log
      
      // Update app state
      onLogin(response.user);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page container">
      <div className="login-card">
        <h2>Login to ScoutBook</h2>
        <p className="muted">Sign in as Athlete or Scout</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </label>
          <label>Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </label>

          {error && <div className="error">{error}</div>}

          <div className="form-actions">
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

          <div className="forgot-password-link">
            <button 
              type="button"
              className="link-button"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot Password?
            </button>
          </div>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <GoogleLogin 
          onSuccess={(user) => {
            onLogin(user);
            navigate('/dashboard');
          }}
          onError={(error) => setError(error)}
        />

        <div className="create-account">
          <p>Don't have an account?</p>
          <button
            className="btn secondary"
            onClick={() => navigate('/signin')}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
