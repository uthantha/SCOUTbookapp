import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';
import '../styles/profile-edit.css';

export default function ProfileEdit({ user, onProfileUpdate }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    location: '',
    district: '',
    province: '',
    bio: '',
    primary_sport: 'Cricket',
    secondary_sports: [],
    position: '',
    batting_style: '',
    bowling_style: '',
    height: '',
    weight: '',
    preferred_foot: '',
    current_team: '',
    previous_teams: [],
    school_college: '',
    achievements: [],
    organization: '',
    certification: '',
    years_experience: '',
    specialization: []
  });

  const sports = ['Cricket'];
  const cricketPositions = [
    'Batsman',
    'Bowler',
    'All-rounder',
    'Wicket-keeper',
    'Opening Batsman',
    'Middle Order Batsman',
    'Fast Bowler',
    'Spin Bowler',
    'Wicket-keeper Batsman'
  ];
  const battingStyles = ['Right-handed', 'Left-handed'];
  const bowlingStyles = [
    'Right-arm Fast',
    'Left-arm Fast',
    'Right-arm Medium',
    'Left-arm Medium',
    'Right-arm Off-spin',
    'Left-arm Orthodox',
    'Right-arm Leg-spin',
    'Left-arm Chinaman',
    'Does not bowl'
  ];
  const provinces = ['Province 1', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];
  const genders = ['Male', 'Female', 'Other'];

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await profileAPI.getProfile();
      if (profile) {
        setFormData({
          ...formData,
          ...profile,
          secondary_sports: profile.secondary_sports || [],
          previous_teams: profile.previous_teams || [],
          achievements: profile.achievements || [],
          specialization: profile.specialization || []
        });
        // Set image preview if profile picture exists
        if (profile.profile_picture) {
          setImagePreview(profile.profile_picture);
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB for original)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      // Create image element to resize
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set target size (400x400 for profile pictures)
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;

        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        const resizedBase64 = canvas.toDataURL('image/jpeg', 0.85); // 85% quality

        setImagePreview(resizedBase64);
        setFormData(prev => ({ ...prev, profile_picture: resizedBase64 }));
        setUploadingImage(false);
      };

      img.onerror = () => {
        setError('Failed to process image');
        setUploadingImage(false);
      };

      reader.onerror = () => {
        setError('Failed to read image file');
        setUploadingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to upload image');
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, profile_picture: null }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayAdd = (field, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const handleArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Validate date of birth
      if (formData.date_of_birth) {
        const birthDate = new Date(formData.date_of_birth);
        const today = new Date();
        const minDate = new Date('1900-01-01');
        
        if (birthDate > today) {
          setError('Date of birth cannot be in the future');
          setSaving(false);
          return;
        }
        
        if (birthDate < minDate) {
          setError('Please enter a valid date of birth (after 1900)');
          setSaving(false);
          return;
        }
        
        // Calculate age
        const age = Math.floor((today - birthDate) / 31557600000);
        if (age < 5) {
          setError('You must be at least 5 years old to register');
          setSaving(false);
          return;
        }
        
        if (age > 100) {
          setError('Please enter a valid date of birth');
          setSaving(false);
          return;
        }
      }

      const updatedProfile = await profileAPI.updateProfile(formData);
      setSuccess('Profile updated successfully!');
      
      // Update user data in App.js
      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }
      
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-edit-wrapper">
        <div className="profile-edit-container">
          <div className="loading-container">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-edit-wrapper">
      <div className="profile-edit-container">
      <div className="profile-edit-header">
        <h1>{user.role === 'player' ? 'Edit Player Profile' : 'Edit Scout Profile'}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Info
        </button>
        {user.role === 'player' && (
          <>
            <button 
              className={`tab ${activeTab === 'sports' ? 'active' : ''}`}
              onClick={() => setActiveTab('sports')}
            >
              Cricket Info
            </button>
            <button 
              className={`tab ${activeTab === 'career' ? 'active' : ''}`}
              onClick={() => setActiveTab('career')}
            >
              Career
            </button>
          </>
        )}
        {user.role === 'scout' && (
          <button 
            className={`tab ${activeTab === 'professional' ? 'active' : ''}`}
            onClick={() => setActiveTab('professional')}
          >
            Professional Info
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <div className="form-section">
            <h2>Basic Information</h2>
            
            {/* Profile Picture Upload */}
            <div className="form-group">
              <label>Profile Picture</label>
              <div className="image-upload-section">
                <div className="image-preview-container">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Profile" />
                      <button 
                        type="button" 
                        className="btn-remove-image"
                        onClick={removeImage}
                        disabled={uploadingImage}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="image-placeholder">
                      <span className="placeholder-icon">📷</span>
                      <span className="placeholder-text">No image</span>
                    </div>
                  )}
                </div>
                <div className="image-upload-actions">
                  <input
                    type="file"
                    id="profile-picture-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="profile-picture-input" className="btn-upload-image">
                    {uploadingImage ? 'Uploading...' : imagePreview ? 'Change Image' : 'Upload Image'}
                  </label>
                  <small className="upload-hint">
                    Images will be automatically resized to 400x400px.<br />
                    Max size: 10MB. Formats: JPG, PNG, GIF
                  </small>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  min="1900-01-01"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  {genders.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+977-XXXXXXXXXX"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Province *</label>
                <select name="province" value={formData.province} onChange={handleChange} required>
                  <option value="">Select Province</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>District *</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g., Kathmandu"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Location/Address</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Thamel, Kathmandu"
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>
        )}

        {/* Sports Information Tab (Players Only) */}
        {activeTab === 'sports' && user.role === 'player' && (
          <div className="form-section">
            <h2>Cricket Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Primary Role *</label>
                <select name="position" value={formData.position} onChange={handleChange} required>
                  <option value="">Select Role</option>
                  {cricketPositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Batting Style *</label>
                <select name="batting_style" value={formData.batting_style} onChange={handleChange} required>
                  <option value="">Select Batting Style</option>
                  {battingStyles.map(style => <option key={style} value={style}>{style}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Bowling Style</label>
                <select name="bowling_style" value={formData.bowling_style} onChange={handleChange}>
                  <option value="">Select Bowling Style</option>
                  {bowlingStyles.map(style => <option key={style} value={style}>{style}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="e.g., 175"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g., 70"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Career Information Tab (Players Only) */}
        {activeTab === 'career' && user.role === 'player' && (
          <div className="form-section">
            <h2>Cricket Career</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Current Team/Club</label>
                <input
                  type="text"
                  name="current_team"
                  value={formData.current_team}
                  onChange={handleChange}
                  placeholder="e.g., Nepal Police Club, Tribhuvan Army Club"
                />
              </div>

              <div className="form-group">
                <label>School/College</label>
                <input
                  type="text"
                  name="school_college"
                  value={formData.school_college}
                  onChange={handleChange}
                  placeholder="e.g., Tribhuvan University"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Previous Teams/Clubs</label>
              <div className="array-input">
                <input
                  type="text"
                  placeholder="Add a team and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayAdd('previous_teams', e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <div className="tags">
                  {formData.previous_teams.map((team, idx) => (
                    <span key={idx} className="tag">
                      {team}
                      <button type="button" onClick={() => handleArrayRemove('previous_teams', idx)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Achievements & Awards</label>
              <small style={{ color: '#6b7280', marginBottom: '8px', display: 'block' }}>
                e.g., Man of the Match, Best Bowler, Tournament Winner, etc.
              </small>
              <div className="array-input">
                <input
                  type="text"
                  placeholder="Add an achievement and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayAdd('achievements', e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <div className="tags">
                  {formData.achievements.map((achievement, idx) => (
                    <span key={idx} className="tag">
                      {achievement}
                      <button type="button" onClick={() => handleArrayRemove('achievements', idx)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Professional Information Tab (Scouts Only) */}
        {activeTab === 'professional' && user.role === 'scout' && (
          <div className="form-section">
            <h2>Professional Information</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Organization/Club</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="e.g., Cricket Association of Nepal (CAN)"
                />
              </div>

              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  name="years_experience"
                  value={formData.years_experience}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Certification</label>
              <input
                type="text"
                name="certification"
                value={formData.certification}
                onChange={handleChange}
                placeholder="e.g., ICC Scouting License, CAN Certified Scout"
              />
            </div>

            <div className="form-group">
              <label>Specialization</label>
              <small style={{ color: '#6b7280', marginBottom: '8px', display: 'block' }}>
                e.g., Batsmen, Bowlers, All-rounders, Youth Cricket, etc.
              </small>
              <div className="array-input">
                <input
                  type="text"
                  placeholder="Add a specialization and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleArrayAdd('specialization', e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <div className="tags">
                  {formData.specialization.map((spec, idx) => (
                    <span key={idx} className="tag">
                      {spec}
                      <button type="button" onClick={() => handleArrayRemove('specialization', idx)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
