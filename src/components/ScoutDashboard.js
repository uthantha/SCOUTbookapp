import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI, tournamentsAPI } from '../services/api';
import '../styles/scout-dashboard.css';

export default function ScoutDashboard({ user }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [stats] = useState({
    opportunitiesPosted: 8,
    applicationsReceived: 45,
    playersViewed: 120,
    shortlisted: 15
  });

  useEffect(() => {
    loadProfile();
    loadTournaments();
    loadTopPlayers();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await profileAPI.getProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const loadTournaments = async () => {
    try {
      setLoadingTournaments(true);
      const data = await tournamentsAPI.getAll();
      // Get upcoming tournaments (next 2)
      const upcoming = data.filter(t => new Date(t.start_date) > new Date()).slice(0, 2);
      setTournaments(upcoming);
    } catch (err) {
      console.error('Error loading tournaments:', err);
    } finally {
      setLoadingTournaments(false);
    }
  };

  const loadTopPlayers = async () => {
    try {
      setLoadingPlayers(true);
      const data = await profileAPI.searchPlayers({});
      // Get first 6 players for display
      setPlayers(data.slice(0, 6));
    } catch (err) {
      console.error('Error loading players:', err);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const displayName = profile?.full_name || user.name || user.email.split('@')[0];

  return (
    <div className="scout-dashboard">
      {/* Hero and Stats Section - Side by Side */}
      <div className="scout-hero-stats-container">
        {/* Hero Section */}
        <section className="scout-hero">
          <div className="scout-hero-overlay">
            <div className="scout-hero-content">
              <div className="scout-hero-badge">
                <svg className="scout-hero-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                <span>Scout Dashboard 2024</span>
              </div>
              <h1 className="scout-hero-title">
                Elite Talent Discovery
              </h1>
              <p className="scout-hero-subtitle">
                Connect with the next generation of cricket stars and build championship teams
              </p>
              <div className="scout-hero-actions">
                <button className="scout-btn scout-btn-primary" onClick={() => navigate('/search-players')}>
                  Explore Talent Pool
                </button>
                <button className="scout-btn scout-btn-secondary" onClick={() => navigate('/opportunities/create')}>
                  Post Opportunity
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Card - Side by Side with Hero */}
        <div className="scout-stats-card scout-stats-hero">
          <div className="scout-stats-header">
            <div className="scout-stats-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18"/>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
              </svg>
            </div>
            <h3>Your Activity</h3>
          </div>
          <div className="scout-stats-grid">
            <div className="scout-stat-item">
              <span className="scout-stat-value">{stats.opportunitiesPosted}</span>
              <span className="scout-stat-label">Opportunities Posted</span>
            </div>
            <div className="scout-stat-item">
              <span className="scout-stat-value">{stats.applicationsReceived}</span>
              <span className="scout-stat-label">Applications</span>
            </div>
            <div className="scout-stat-item">
              <span className="scout-stat-value">{stats.playersViewed}</span>
              <span className="scout-stat-label">Players Viewed</span>
            </div>
            <div className="scout-stat-item">
              <span className="scout-stat-value">{stats.shortlisted}</span>
              <span className="scout-stat-label">Shortlisted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="scout-content">
        <div className="scout-grid">
          {/* Main Section */}
          <div className="scout-main">
            {/* Most Searched Players */}
            <div className="scout-section">
              <div className="scout-section-header">
                <div>
                  <h2 className="scout-section-title">Most Searched Players</h2>
                  <p className="scout-section-subtitle">Discover top talent in the cricket community</p>
                </div>
                <button className="scout-btn scout-btn-outline" onClick={() => navigate('/search-players')}>
                  View All Players
                </button>
              </div>
              
              {loadingPlayers ? (
                <div className="scout-loading">
                  <div className="scout-spinner"></div>
                  <p>Loading players...</p>
                </div>
              ) : players.length === 0 ? (
                <div className="scout-empty-state">
                  <div className="scout-empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <h3>No Players Found</h3>
                  <p>Check back later to discover talented cricket players</p>
                  <button className="scout-btn scout-btn-primary" onClick={() => navigate('/search-players')}>
                    Search Players
                  </button>
                </div>
              ) : (
                <div className="scout-players-grid">
                  {players.map((player) => (
                    <div key={player.user_id} className="scout-player-card" onClick={() => navigate(`/profile/${player.user_id}`)}>
                      <div className="scout-player-avatar">
                        {player.profile_picture ? (
                          <img src={player.profile_picture} alt={player.full_name} />
                        ) : (
                          <div className="scout-player-avatar-placeholder">
                            <span className="material-icons">person</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="scout-player-info">
                        <h3 className="scout-player-name">{player.full_name || player.name || 'Unknown Player'}</h3>
                        <span className="scout-player-position">{player.position || 'Cricket Player'}</span>
                        
                        <div className="scout-player-details">
                          {player.batting_style && (
                            <div className="scout-player-detail">
                              <span className="material-icons">sports_cricket</span>
                              <span>Batting: {player.batting_style}</span>
                            </div>
                          )}
                          {player.bowling_style && (
                            <div className="scout-player-detail">
                              <span className="material-icons">sports_baseball</span>
                              <span>Bowling: {player.bowling_style}</span>
                            </div>
                          )}
                          {player.location && (
                            <div className="scout-player-detail">
                              <span className="material-icons">location_on</span>
                              <span>{player.location}</span>
                            </div>
                          )}
                        </div>
                        
                        {(player.height || player.experience_years) && (
                          <div className="scout-player-stats">
                            {player.height && (
                              <div className="scout-player-stat">
                                <span className="scout-stat-label">Height</span>
                                <span className="scout-stat-value">{player.height}cm</span>
                              </div>
                            )}
                            {player.experience_years && (
                              <div className="scout-player-stat">
                                <span className="scout-stat-label">Experience</span>
                                <span className="scout-stat-value">{player.experience_years}y</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="scout-player-actions">
                        <button className="scout-player-btn" onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${player.user_id}`);
                        }}>
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tournaments Section */}
            <div className="scout-section">
              <div className="scout-section-header">
                <div>
                  <h2 className="scout-section-title">Upcoming Tournaments</h2>
                  <p className="scout-section-subtitle">Discover new talent at these events</p>
                </div>
                <button className="scout-btn scout-btn-outline" onClick={() => navigate('/tournaments')}>
                  View All
                </button>
              </div>

              {loadingTournaments ? (
                <div className="scout-loading">
                  <div className="scout-spinner"></div>
                  <p>Loading tournaments...</p>
                </div>
              ) : tournaments.length === 0 ? (
                <div className="scout-empty-state">
                  <div className="scout-empty-icon">
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
                  <button className="scout-btn scout-btn-primary" onClick={() => navigate('/tournaments')}>
                    Browse All Tournaments
                  </button>
                </div>
              ) : (
                <div className="scout-tournaments-grid">
                  {tournaments.map((tournament) => (
                    <div key={tournament.id} className="scout-tournament-card" onClick={() => navigate(`/tournaments/${tournament.id}`)}>
                      <div className="scout-tournament-header">
                        <span className="scout-tournament-badge">
                          {tournament.sport}
                        </span>
                        <span className="scout-tournament-date">
                          {new Date(tournament.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="scout-tournament-body">
                        <h3 className="scout-tournament-title">{tournament.name}</h3>
                        <div className="scout-tournament-meta">
                          <span className="scout-tournament-location">
                            <svg className="scout-location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {tournament.location}
                          </span>
                          <span className="scout-tournament-level">
                            <svg className="scout-target-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <circle cx="12" cy="12" r="6"/>
                              <circle cx="12" cy="12" r="2"/>
                            </svg>
                            {tournament.level || 'All Levels'}
                          </span>
                        </div>
                        {tournament.description && (
                          <p className="scout-tournament-desc">{tournament.description.substring(0, 100)}...</p>
                        )}
                      </div>
                      
                      <div className="scout-tournament-footer">
                        <div className="scout-tournament-stats">
                          <span className="scout-tournament-stat">
                            <strong>{tournament.registration_count || 0}</strong> Registered
                          </span>
                        </div>
                        <button className="scout-tournament-btn">
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="scout-sidebar">
            {/* Profile Completion */}
            {(!profile || !profile.full_name) && (
              <div className="scout-profile-card">
                <div className="scout-profile-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div className="scout-profile-content">
                  <h4>Complete Your Profile</h4>
                  <p>Add organization details to build trust with players</p>
                  <button className="scout-btn scout-btn-primary scout-btn-small" onClick={() => navigate('/profile/edit')}>
                    Complete Profile
                  </button>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="scout-activity-card">
              <h3>Recent Activity</h3>
              <div className="scout-activity-list">
                <div className="scout-activity-item">
                  <div className="scout-activity-dot scout-dot-success"></div>
                  <div className="scout-activity-content">
                    <p><strong>New application</strong> received for Cricket Trial</p>
                    <span className="scout-activity-time">2 hours ago</span>
                  </div>
                </div>
                <div className="scout-activity-item">
                  <div className="scout-activity-dot scout-dot-info"></div>
                  <div className="scout-activity-content">
                    <p><strong>Tournament registration</strong> deadline approaching</p>
                    <span className="scout-activity-time">1 day ago</span>
                  </div>
                </div>
                <div className="scout-activity-item">
                  <div className="scout-activity-dot scout-dot-warning"></div>
                  <div className="scout-activity-content">
                    <p><strong>Profile views</strong> increased by 25%</p>
                    <span className="scout-activity-time">3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
