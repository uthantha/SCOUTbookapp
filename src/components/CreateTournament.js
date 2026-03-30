import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { tournamentsAPI } from '../services/api';
import '../styles/create-tournament.css';

export default function CreateTournament({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tournament_format: 'T20',
    location: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_teams: '',
    entry_fee: '',
    prize_details: '',
    rules: '',
    contact_info: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await tournamentsAPI.create(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/tournaments');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-with-sidebar">
      <Sidebar user={user} />
      
      <div className="dashboard-main-content">
        <div className="create-tournament-container">
          <div className="create-tournament-header">
            <h1>Create Tournament</h1>
            <p className="subtitle">Your tournament will be reviewed by admin before being published</p>
          </div>

          {success && (
            <div className="success-message">
              ✅ Tournament created successfully! Awaiting admin approval. Redirecting...
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="tournament-form">
            {/* Basic Information */}
            <div className="form-section">
              <h2>Basic Information</h2>
              
              <div className="form-group">
                <label>Tournament Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Summer Cricket Championship 2026"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your tournament, its purpose, and what makes it special..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tournament Format *</label>
                  <select
                    name="tournament_format"
                    value={formData.tournament_format}
                    onChange={handleChange}
                    required
                  >
                    <option value="T20">T20</option>
                    <option value="ODI">ODI (One Day)</option>
                    <option value="Test">Test Match</option>
                    <option value="T10">T10</option>
                    <option value="League">League</option>
                    <option value="Knockout">Knockout</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Kathmandu, Nepal"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="form-section">
              <h2>Important Dates</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Registration Deadline</label>
                  <input
                    type="date"
                    name="registration_deadline"
                    value={formData.registration_deadline}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Registration Details */}
            <div className="form-section">
              <h2>Registration Details</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Maximum Teams</label>
                  <input
                    type="number"
                    name="max_teams"
                    value={formData.max_teams}
                    onChange={handleChange}
                    placeholder="e.g., 16"
                    min="2"
                  />
                </div>

                <div className="form-group">
                  <label>Entry Fee</label>
                  <input
                    type="text"
                    name="entry_fee"
                    value={formData.entry_fee}
                    onChange={handleChange}
                    placeholder="e.g., NPR 5000 per team or Free"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-section">
              <h2>Additional Information</h2>
              
              <div className="form-group">
                <label>Prize Details</label>
                <textarea
                  name="prize_details"
                  value={formData.prize_details}
                  onChange={handleChange}
                  placeholder="Describe prizes for winners, runners-up, etc."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Rules & Regulations</label>
                <textarea
                  name="rules"
                  value={formData.rules}
                  onChange={handleChange}
                  placeholder="List important rules and regulations for the tournament"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Contact Information *</label>
                <textarea
                  name="contact_info"
                  value={formData.contact_info}
                  onChange={handleChange}
                  placeholder="Provide contact details for inquiries (email, phone, etc.)"
                  rows="2"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/tournaments')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Tournament'}
              </button>
            </div>

            <div className="form-note">
              <p>
                <strong>Note:</strong> Your tournament will be submitted for admin review. 
                Once approved, it will be visible to all users on the platform.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
