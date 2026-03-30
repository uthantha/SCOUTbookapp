import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { profileAPI } from '../services/api';
import '../styles/profile-view.css';

export default function ProfileView({ user }) {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isOwnProfile = !userId || parseInt(userId) === user.id;

  useEffect(() => {
    loadProfile();
    
    // Track profile view if viewing another user's profile
    if (userId && parseInt(userId) !== user.id) {
      const viewKey = `profile_view_${userId}`;
      const hasViewed = sessionStorage.getItem(viewKey);
      
      if (!hasViewed) {
        trackProfileView();
        sessionStorage.setItem(viewKey, 'true');
      }
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      let profileData;
      if (userId) {
        // Load another user's profile
        profileData = await profileAPI.getProfileById(userId);
      } else {
        // Load current user's profile
        profileData = await profileAPI.getProfile();
      }
      setProfile(profileData);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const trackProfileView = async () => {
    try {
      await profileAPI.incrementProfileView(userId);
    } catch (err) {
      console.error('Error tracking profile view:', err);
    }
  };

  if (loading) {
    return (
      <div className="profile-view-wrapper">
        <div className="profile-view-container">
          <div className="loading-container">Loading profile...</div>
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name || user.name || user.email;
  
  // Calculate age with validation
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const today = new Date();
    
    // Check if date is valid
    if (isNaN(birth.getTime())) return null;
    
    // Check if date is in the future
    if (birth > today) return null;
    
    const age = Math.floor((today - birth) / 31557600000);
    
    // Return null for invalid ages
    if (age < 0 || age > 150) return null;
    
    return age;
  };
  
  const age = calculateAge(profile?.date_of_birth);
  const profilePicture = profile?.profile_picture || user.profile_picture;

  return (
    <div className="profile-view-wrapper">
      <div className="profile-view-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-cover">
          <div className="profile-avatar-section">
            {profilePicture ? (
              <img src={profilePicture} alt={displayName} className="profile-avatar-large" />
            ) : (
              <div className="profile-avatar-large placeholder">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        
        <div className="profile-header-info">
          <div className="profile-name-section">
            <h1>{displayName}</h1>
            <div className="profile-meta">
              <span className="role-badge">
                {user.role === 'player' ? (
                  <>
                    <span className="material-icons">sports_cricket</span> Player
                  </>
                ) : (
                  <>
                    <span className="material-icons">search</span> Scout
                  </>
                )}
              </span>
              {profile?.verified && (
                <span className="verified-badge">
                  <span className="material-icons">verified</span> Verified
                </span>
              )}
            </div>
          </div>
          
          {isOwnProfile && (
            <button className="btn-edit-profile" onClick={() => navigate('/profile/edit')}>
              <span className="material-icons">edit</span> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Basic Information */}
        <div className="profile-section">
          <h2>Basic Information</h2>
          <div className="info-grid">
            {profile?.date_of_birth && (
              <div className="info-item">
                <span className="info-label">Age</span>
                <span className="info-value">{age} years</span>
              </div>
            )}
            {profile?.gender && (
              <div className="info-item">
                <span className="info-label">Gender</span>
                <span className="info-value">{profile.gender}</span>
              </div>
            )}
            {profile?.phone && (
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{profile.phone}</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{user.email}</span>
            </div>
            {profile?.location && (
              <div className="info-item">
                <span className="info-label">Location</span>
                <span className="info-value">{profile.location}</span>
              </div>
            )}
            {profile?.district && (
              <div className="info-item">
                <span className="info-label">District</span>
                <span className="info-value">{profile.district}</span>
              </div>
            )}
            {profile?.province && (
              <div className="info-item">
                <span className="info-label">Province</span>
                <span className="info-value">{profile.province}</span>
              </div>
            )}
          </div>
          
          {profile?.bio && (
            <div className="bio-section">
              <h3>About</h3>
              <p>{profile.bio}</p>
            </div>
          )}
        </div>

        {/* Cricket Information (Players Only) */}
        {user.role === 'player' && (
          <div className="profile-section">
            <h2>Cricket Information</h2>
            <div className="info-grid">
              {profile?.position && (
                <div className="info-item">
                  <span className="info-label">Primary Role</span>
                  <span className="info-value highlight">{profile.position}</span>
                </div>
              )}
              {profile?.batting_style && (
                <div className="info-item">
                  <span className="info-label">Batting Style</span>
                  <span className="info-value">{profile.batting_style}</span>
                </div>
              )}
              {profile?.bowling_style && profile.bowling_style !== 'Does not bowl' && (
                <div className="info-item">
                  <span className="info-label">Bowling Style</span>
                  <span className="info-value">{profile.bowling_style}</span>
                </div>
              )}
              {profile?.height && (
                <div className="info-item">
                  <span className="info-label">Height</span>
                  <span className="info-value">{profile.height} cm</span>
                </div>
              )}
              {profile?.weight && (
                <div className="info-item">
                  <span className="info-label">Weight</span>
                  <span className="info-value">{profile.weight} kg</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Career Information (Players Only) */}
        {user.role === 'player' && (
          <div className="profile-section">
            <h2>Cricket Career</h2>
            <div className="info-grid">
              {profile?.current_team && (
                <div className="info-item full-width">
                  <span className="info-label">Current Team</span>
                  <span className="info-value">{profile.current_team}</span>
                </div>
              )}
              {profile?.school_college && (
                <div className="info-item full-width">
                  <span className="info-label">School/College</span>
                  <span className="info-value">{profile.school_college}</span>
                </div>
              )}
            </div>

            {profile?.previous_teams && profile.previous_teams.length > 0 && (
              <div className="list-section">
                <h3>Previous Teams</h3>
                <div className="tags-display">
                  {profile.previous_teams.map((team, idx) => (
                    <span key={idx} className="tag">{team}</span>
                  ))}
                </div>
              </div>
            )}

            {profile?.achievements && profile.achievements.length > 0 && (
              <div className="list-section">
                <h3>Achievements & Awards</h3>
                <ul className="achievements-list">
                  {profile.achievements.map((achievement, idx) => (
                    <li key={idx}>
                      <span className="material-icons">emoji_events</span> {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Professional Information (Scouts Only) */}
        {user.role === 'scout' && (
          <div className="profile-section">
            <h2>Professional Information</h2>
            <div className="info-grid">
              {profile?.organization && (
                <div className="info-item">
                  <span className="info-label">Organization</span>
                  <span className="info-value">{profile.organization}</span>
                </div>
              )}
              {profile?.years_experience && (
                <div className="info-item">
                  <span className="info-label">Experience</span>
                  <span className="info-value">{profile.years_experience} years</span>
                </div>
              )}
              {profile?.certification && (
                <div className="info-item full-width">
                  <span className="info-label">Certification</span>
                  <span className="info-value">{profile.certification}</span>
                </div>
              )}
            </div>

            {profile?.specialization && profile.specialization.length > 0 && (
              <div className="list-section">
                <h3>Specialization</h3>
                <div className="tags-display">
                  {profile.specialization.map((spec, idx) => (
                    <span key={idx} className="tag">{spec}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Section */}
        <div className="profile-section">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-number">{profile?.total_videos || 0}</div>
              <div className="stat-label">Videos</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{profile?.total_likes || 0}</div>
              <div className="stat-label">Applause</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{profile?.profile_views || 0}</div>
              <div className="stat-label">Profile Views</div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!profile && (
          <div className="empty-profile">
            <div className="empty-icon">
              <span className="material-icons">edit</span>
            </div>
            <h3>Complete Your Profile</h3>
            <p>Add your information to get discovered by scouts and teams!</p>
            <button className="btn-primary" onClick={() => navigate('/profile/edit')}>
              Complete Profile
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
