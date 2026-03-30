import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/role-selection.css';

export default function RoleSelection({ onLogin }) {
  const [role, setRole] = useState('player');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password && password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const tempToken = searchParams.get('temp_token');
      const userParam = searchParams.get('user');

      if (!tempToken || !userParam) {
        throw new Error('Invalid authentication data');
      }

      // Complete Google OAuth with selected role and optional password
      const response = await authAPI.completeGoogleAuth(tempToken, role, password || null);
      
      // Store final token and user data
      localStorage.setItem('sb_token', response.token);
      localStorage.setItem('sb_user', JSON.stringify(response.user));
      
      // Update app state
      onLogin(response.user);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Role selection error:', error);
      setError(error.response?.data?.error || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };

  const user = searchParams.get('user') ? JSON.parse(decodeURIComponent(searchParams.get('user'))) : null;

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="role-selection-page container">
      <div className="role-selection-card">
        <div className="user-info">
          {user.profile_picture && (
            <img 
              src={user.profile_picture} 
              alt="Profile" 
              className="profile-picture"
            />
          )}
          <h2>Welcome, {user.name}!</h2>
          <p className="email">{user.email}</p>
        </div>

        <div className="role-selection-content">
          <h3>Complete Your Profile</h3>
          <p className="description">
            Choose your role and optionally set a password to enable email/password login.
          </p>

          <form onSubmit={handleRoleSubmit} className="role-form">
            <div className="role-options">
              <label className={`role-option ${role === 'player' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="player"
                  checked={role === 'player'}
                  onChange={(e) => setRole(e.target.value)}
                />
                <div className="role-card">
                  <div className="role-icon">⚽</div>
                  <h4>Player</h4>
                  <p>Showcase your skills, get discovered by scouts, and find opportunities</p>
                </div>
              </label>

              <label className={`role-option ${role === 'scout' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="scout"
                  checked={role === 'scout'}
                  onChange={(e) => setRole(e.target.value)}
                />
                <div className="role-card">
                  <div className="role-icon">
                    <span className="material-icons">search</span>
                  </div>
                  <h4>Scout</h4>
                  <p>Discover talented players, manage trials, and build your team</p>
                </div>
              </label>
            </div>

            <div className="password-section">
              <h4>🔐 Set a Password (Optional)</h4>
              <p className="password-hint">
                Set a password to login with email/password in addition to Google Sign-In
              </p>
              
              <label>Password (Optional)
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                />
              </label>

              {password && (
                <label>Confirm Password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                  />
                </label>
              )}
            </div>

            {error && <div className="error">{error}</div>}

            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? 'Completing Setup...' : 'Continue to ScoutBook'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}