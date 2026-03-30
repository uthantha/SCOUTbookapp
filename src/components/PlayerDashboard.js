import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI, opportunitiesAPI, tournamentsAPI } from '../services/api';
import '../styles/player-dashboard.css';

export default function PlayerDashboard({ user }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [scouts, setScouts] = useState([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(true);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [stats] = useState({
    totalVideos: 24,
    totalLikes: 1400,
    profileViews: 2300,
    applicationsSubmitted: 12,
    scoutConnections: 8,
    tournamentWins: 3
  });

  useEffect(() => {
    loadProfile();
    loadOpportunities();
    loadTournaments();
    loadRecentActivity();
    loadScouts();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await profileAPI.getProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const loadOpportunities = async () => {
    try {
      setLoadingOpportunities(true);
      const data = await opportunitiesAPI.getAll();
      setOpportunities(data.slice(0, 6));
    } catch (err) {
      console.error('Error loading opportunities:', err);
    } finally {
      setLoadingOpportunities(false);
    }
  };

  const loadTournaments = async () => {
    try {
      setLoadingTournaments(true);
      const data = await tournamentsAPI.getAll();
      setTournaments(data.slice(0, 3));
    } catch (err) {
      console.error('Error loading tournaments:', err);
    } finally {
      setLoadingTournaments(false);
    }
  };

  const loadRecentActivity = () => {
    // Mock recent activity data
    setRecentActivity([
      { id: 1, type: 'application', title: 'Applied to Mumbai Cricket Academy', time: '2 hours ago', icon: 'send' },
      { id: 2, type: 'profile_view', title: 'Profile viewed by Chennai Super Kings Scout', time: '5 hours ago', icon: 'visibility' },
      { id: 3, type: 'video_upload', title: 'Uploaded batting highlights video', time: '1 day ago', icon: 'video_library' },
      { id: 4, type: 'tournament', title: 'Registered for State Championship', time: '2 days ago', icon: 'emoji_events' }
    ]);
  };

  const loadScouts = () => {
    // Mock demo scouts data
    setScouts([
      { 
        id: 1, 
        user_id: 101,
        full_name: 'Rajesh Kumar', 
        organization: 'Mumbai Cricket Academy',
        profile_picture: null
      },
      { 
        id: 2, 
        user_id: 102,
        full_name: 'Priya Sharma', 
        organization: 'Chennai Super Kings',
        profile_picture: null
      },
      { 
        id: 3, 
        user_id: 103,
        full_name: 'Amit Patel', 
        organization: 'Delhi Capitals',
        profile_picture: null
      }
    ]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const displayName = profile?.full_name || user.name || user.email.split('@')[0];

  return (
    <div className="player-dashboard">
      {/* Hero and Stats Section - Side by Side */}
      <div className="player-hero-stats-container">
        {/* Hero Section */}
        <section className="player-hero">
          <div className="player-hero-overlay">
            <div className="player-hero-content">
              <div className="player-hero-badge">
                <svg className="player-hero-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                <span>Player Dashboard 2024</span>
              </div>
              <h1 className="player-hero-title">
                Showcase Your Talent
              </h1>
              <p className="player-hero-subtitle">
                Welcome back, {displayName}! Your journey to greatness continues here
              </p>
              <div className="player-hero-actions">
                <button className="player-btn player-btn-primary" onClick={() => navigate('/opportunities')}>
                  Browse Opportunities
                </button>
                <button className="player-btn player-btn-secondary" onClick={() => navigate('/profile/edit')}>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Card - Side by Side with Hero */}
        <div className="player-stats-card player-stats-hero">
          <div className="player-stats-header">
            <div className="player-stats-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18"/>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
              </svg>
            </div>
            <h3>Your Activity</h3>
          </div>
          <div className="player-stats-grid">
            <div className="player-stat-item">
              <span className="player-stat-value">{stats.totalVideos}</span>
              <span className="player-stat-label">Videos</span>
            </div>
            <div className="player-stat-item">
              <span className="player-stat-value">{stats.applicationsSubmitted}</span>
              <span className="player-stat-label">Applications</span>
            </div>
            <div className="player-stat-item">
              <span className="player-stat-value">{stats.profileViews > 999 ? `${(stats.profileViews / 1000).toFixed(1)}K` : stats.profileViews}</span>
              <span className="player-stat-label">Profile Views</span>
            </div>
            <div className="player-stat-item">
              <span className="player-stat-value">{stats.totalLikes}</span>
              <span className="player-stat-label">Likes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="player-content">
        <div className="player-grid">
          {/* Main Section */}
          <div className="player-main">
            {/* Hot Opportunities */}
            <div className="player-section">
              <div className="player-section-header">
                <div>
                  <h2 className="player-section-title">Hot Opportunities</h2>
                  <p className="player-section-subtitle">Latest opportunities to showcase your talent</p>
                </div>
                <button className="player-btn player-btn-outline" onClick={() => navigate('/opportunities')}>
                  View All
                </button>
              </div>

              {loadingOpportunities ? (
                <div className="player-loading">
                  <div className="player-spinner"></div>
                  <p>Loading opportunities...</p>
                </div>
              ) : opportunities.length === 0 ? (
                <div className="player-empty-state">
                  <div className="player-empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                  </div>
                  <h3>No Opportunities Available</h3>
                  <p>Check back later for new opportunities to showcase your talent</p>
                  <button className="player-btn player-btn-primary" onClick={() => navigate('/opportunities')}>
                    Browse All Opportunities
                  </button>
                </div>
              ) : (
                <div className="player-opportunities-grid">
                  {opportunities.map((opp) => (
                    <div key={opp.id} className="player-opportunity-card" onClick={() => navigate(`/opportunities/${opp.id}`)}>
                      <div className="player-opp-content">
                        <div className="player-opp-top">
                          <span className={`player-opp-badge ${opp.opportunity_type}`}>
                            {opp.opportunity_type}
                          </span>
                          <h3 className="player-opp-title">{opp.title}</h3>
                        </div>
                        
                        <div className="player-opp-details">
                          <span className="player-opp-location">
                            <svg className="player-location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {opp.location}
                          </span>
                          {opp.deadline && (
                            <span className="player-opp-deadline">
                              <svg className="player-clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {formatDate(opp.deadline)}
                            </span>
                          )}
                        </div>
                        
                        <button className="player-opp-apply-btn">
                          Apply Now
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Tournaments */}
            <div className="player-section">
              <div className="player-section-header">
                <div>
                  <h2 className="player-section-title">Upcoming Tournaments</h2>
                  <p className="player-section-subtitle">Register and showcase your skills</p>
                </div>
                <button className="player-btn player-btn-outline" onClick={() => navigate('/tournaments')}>
                  View All
                </button>
              </div>

              {loadingTournaments ? (
                <div className="player-loading">
                  <div className="player-spinner"></div>
                  <p>Loading tournaments...</p>
                </div>
              ) : tournaments.length === 0 ? (
                <div className="player-empty-state">
                  <div className="player-empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                      <path d="M4 22h16"/>
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                    </svg>
                  </div>
                  <h3>No Upcoming Tournaments</h3>
                  <p>Check back later for new tournament opportunities</p>
                  <button className="player-btn player-btn-primary" onClick={() => navigate('/tournaments')}>
                    Browse All Tournaments
                  </button>
                </div>
              ) : (
                <div className="player-tournaments-grid">
                  {tournaments.map((tournament) => (
                    <div key={tournament.id} className="player-tournament-card" onClick={() => navigate(`/tournaments/${tournament.id}`)}>
                      <div className="player-tournament-header">
                        <span className="player-tournament-badge">
                          {tournament.sport}
                        </span>
                        <span className="player-tournament-date">
                          {new Date(tournament.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="player-tournament-body">
                        <h3 className="player-tournament-title">{tournament.name}</h3>
                        <div className="player-tournament-meta">
                          <span className="player-tournament-location">
                            <svg className="player-location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {tournament.location}
                          </span>
                          <span className="player-tournament-level">
                            <svg className="player-target-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <circle cx="12" cy="12" r="6"/>
                              <circle cx="12" cy="12" r="2"/>
                            </svg>
                            {tournament.level || 'All Levels'}
                          </span>
                        </div>
                        {tournament.description && (
                          <p className="player-tournament-desc">{tournament.description.substring(0, 100)}...</p>
                        )}
                      </div>
                      
                      <div className="player-tournament-footer">
                        <div className="player-tournament-stats">
                          <span className="player-tournament-stat">
                            <strong>{tournament.registration_count || 0}</strong> Registered
                          </span>
                        </div>
                        <button className="player-tournament-btn">
                          Register Now →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="player-sidebar">
            {/* Profile Completion */}
            {(!profile || !profile.full_name) && (
              <div className="player-profile-card">
                <div className="player-profile-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div className="player-profile-content">
                  <h4>Complete Your Profile</h4>
                  <p>Add more details to increase your visibility to scouts</p>
                  <button className="player-btn player-btn-primary player-btn-small" onClick={() => navigate('/profile/edit')}>
                    Complete Profile
                  </button>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="player-activity-card">
              <h3>Recent Activity</h3>
              <div className="player-activity-list">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="player-activity-item">
                    <div className={`player-activity-dot player-dot-${activity.type === 'application' ? 'success' : activity.type === 'profile_view' ? 'info' : 'warning'}`}></div>
                    <div className="player-activity-content">
                      <p>{activity.title}</p>
                      <span className="player-activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Network with Scouts */}
            <div className="player-scouts-card">
              <h3>Network with Scouts</h3>
              <div className="player-scouts-list">
                {scouts.map((scout) => (
                  <div 
                    key={scout.user_id} 
                    className="player-scout-item"
                    onClick={() => navigate(`/profile/${scout.user_id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="player-scout-avatar">
                      {scout.profile_picture ? (
                        <img src={scout.profile_picture} alt={scout.full_name} className="player-scout-avatar-img" />
                      ) : (
                        <div className="player-scout-avatar-placeholder">
                          <span className="material-icons">person</span>
                        </div>
                      )}
                    </div>
                    <div className="player-scout-info">
                      <div className="player-scout-name">{scout.full_name || scout.name || 'Scout User'}</div>
                      <div className="player-scout-org">{scout.organization || 'Cricket Scout'}</div>
                    </div>
                    <button 
                      className="player-scout-message-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/messages');
                      }}
                    >
                      <span className="material-icons">message</span>
                    </button>
                  </div>
                ))}
              </div>
              <button className="player-btn player-btn-primary player-btn-small" onClick={() => navigate('/search-scouts')} style={{ width: '100%', marginTop: '1rem' }}>
                Find More Scouts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
