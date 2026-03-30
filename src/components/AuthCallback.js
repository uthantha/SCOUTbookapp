import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { profileAPI } from '../services/api';

export default function AuthCallback({ onLogin }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');
      const error = searchParams.get('error');

      if (error) {
        console.error('Auth error:', error);
        navigate('/login?error=Authentication failed');
        return;
      }

      if (token && userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));
          
          // Store token first
          localStorage.setItem('sb_token', token);
          
          // Fetch profile data to get updated name and picture
          try {
            const profile = await profileAPI.getProfile();
            if (profile) {
              user.name = profile.full_name || user.name;
              user.profile_picture = profile.profile_picture || user.profile_picture;
            }
          } catch (profileError) {
            console.log('No profile data yet, using default');
          }
          
          // Store updated user data
          localStorage.setItem('sb_user', JSON.stringify(user));
          
          // Update app state
          onLogin(user);
          
          // Redirect to dashboard
          navigate('/dashboard');
        } catch (error) {
          console.error('Error processing auth callback:', error);
          navigate('/login?error=Authentication failed');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, onLogin]);

  return (
    <div className="auth-callback">
      <div className="loading">
        <div className="spinner"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
}