import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { profileAPI } from '../services/api';
import '../styles/player-dashboard.css';

export default function Sidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await profileAPI.getProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sb_token');
    localStorage.removeItem('sb_user');
    navigate('/login');
    window.location.reload();
  };

  const displayName = profile?.full_name || user?.name || user?.email?.split('@')[0] || 'User';
  const isPlayer = user?.role === 'player';
  const isScout = user?.role === 'scout';
  const isAdmin = user?.role === 'admin';

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar-nav">
      <div className="sidebar-header">
        <div className="logo-circle">
          <span className="material-icons">sports_cricket</span>
        </div>
        <h2 className="logo-text">ScoutBook</h2>
      </div>
      
      <nav className="nav-menu">
        <button 
          className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          <span className="nav-icon cyan-icon">
            <span className="material-icons">dashboard</span>
          </span>
          <span className="nav-label">Dashboard</span>
        </button>
        
        <button 
          className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
        >
          <span className="nav-icon purple-icon">
            <span className="material-icons">person</span>
          </span>
          <span className="nav-label">Profile</span>
        </button>
        
        <button 
          className={`nav-item ${isActive('/messages') ? 'active' : ''}`}
          onClick={() => navigate('/messages')}
        >
          <span className="nav-icon pink-icon">
            <span className="material-icons">message</span>
          </span>
          <span className="nav-label">Messages</span>
        </button>
        
        {isPlayer && (
          <>
            <button 
              className={`nav-item ${isActive('/leaderboard') ? 'active' : ''}`}
              onClick={() => navigate('/leaderboard')}
            >
              <span className="nav-icon orange-icon">
                <span className="material-icons">leaderboard</span>
              </span>
              <span className="nav-label">Leaderboard</span>
            </button>
            
            <button 
              className={`nav-item ${isActive('/opportunities') ? 'active' : ''}`}
              onClick={() => navigate('/opportunities')}
            >
              <span className="nav-icon pink-icon">
                <span className="material-icons">work</span>
              </span>
              <span className="nav-label">Opportunities</span>
            </button>
            
            <button 
              className={`nav-item ${isActive('/search-scouts') ? 'active' : ''}`}
              onClick={() => navigate('/search-scouts')}
            >
              <span className="nav-icon cyan-icon">
                <span className="material-icons">search</span>
              </span>
              <span className="nav-label">Find Scouts</span>
            </button>
          </>
        )}
        
        {isScout && (
          <>
            <button 
              className={`nav-item ${isActive('/opportunities/manage') ? 'active' : ''}`}
              onClick={() => navigate('/opportunities/manage')}
            >
              <span className="nav-icon orange-icon">
                <span className="material-icons">edit</span>
              </span>
              <span className="nav-label">My Posts</span>
            </button>
            
            <button 
              className={`nav-item ${isActive('/search-players') ? 'active' : ''}`}
              onClick={() => navigate('/search-players')}
            >
              <span className="nav-icon pink-icon">
                <span className="material-icons">search</span>
              </span>
              <span className="nav-label">Search Players</span>
            </button>
          </>
        )}
        
        {isAdmin && (
          <>
            <button 
              className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}
              onClick={() => navigate('/admin/users')}
            >
              <span className="nav-icon purple-icon">
                <span className="material-icons">group</span>
              </span>
              <span className="nav-label">Users</span>
            </button>
            
            <button 
              className={`nav-item ${isActive('/admin/opportunities') ? 'active' : ''}`}
              onClick={() => navigate('/admin/opportunities')}
            >
              <span className="nav-icon orange-icon">
                <span className="material-icons">work</span>
              </span>
              <span className="nav-label">Opportunities</span>
            </button>
            
            <button 
              className={`nav-item ${isActive('/admin/tournaments') ? 'active' : ''}`}
              onClick={() => navigate('/admin/tournaments')}
            >
              <span className="nav-icon pink-icon">
                <span className="material-icons">emoji_events</span>
              </span>
              <span className="nav-label">Tournaments</span>
            </button>
          </>
        )}
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-profile-sidebar">
          {profile?.profile_picture ? (
            <img src={profile.profile_picture} alt={displayName} className="sidebar-avatar" />
          ) : (
            <div className="sidebar-avatar-placeholder">
              <span className="material-icons">person</span>
            </div>
          )}
          <div className="user-info-sidebar">
            <div className="user-name-sidebar">{displayName}</div>
            <div className="user-role-sidebar">
              {isPlayer ? 'Professional Player' : isScout ? 'Scout' : 'Administrator'}
            </div>
          </div>
        </div>
        <button className="logout-btn-sidebar" onClick={handleLogout}>
          <span className="material-icons">logout</span> Logout
        </button>
      </div>
    </aside>
  );
}
