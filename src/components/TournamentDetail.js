import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import { tournamentsAPI } from '../services/api';
import '../styles/tournament-detail.css';

export default function TournamentDetail({ user }) {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const [formData, setFormData] = useState({
    team_name: '',
    contact_email: user?.email || '',
    contact_phone: '',
    team_size: '',
    additional_info: ''
  });

  useEffect(() => {
    loadTournamentDetails();
    loadRegistrations();
    checkIfRegistered();
  }, [id]);

  const loadTournamentDetails = async () => {
    try {
      setLoading(true);
      const data = await tournamentsAPI.getById(id);
      setTournament(data);
    } catch (err) {
      setError('Failed to load tournament details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const data = await tournamentsAPI.getRegistrations(id);
      setRegistrations(data);
    } catch (err) {
      console.error('Error loading registrations:', err);
    }
  };

  const checkIfRegistered = async () => {
    try {
      const myRegistrations = await tournamentsAPI.getMyRegistrations();
      const registered = myRegistrations.some(reg => reg.tournament_id === parseInt(id));
      setAlreadyRegistered(registered);
    } catch (err) {
      console.error('Error checking registration:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setRegistering(true);

    try {
      await tournamentsAPI.register(id, formData);
      alert('Team registered successfully!');
      setShowRegisterModal(false);
      setAlreadyRegistered(true);
      loadRegistrations();
      // Reset form
      setFormData({
        team_name: '',
        contact_email: user?.email || '',
        contact_phone: '',
        team_size: '',
        additional_info: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register team');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isRegistrationOpen = () => {
    if (!tournament) return false;
    if (tournament.registration_deadline) {
      return new Date(tournament.registration_deadline) > new Date();
    }
    return new Date(tournament.start_date) > new Date();
  };

  const isTournamentFull = () => {
    if (!tournament || !tournament.max_teams) return false;
    return registrations.length >= tournament.max_teams;
  };

  const canRegister = () => {
    return !alreadyRegistered && isRegistrationOpen() && !isTournamentFull();
  };

  if (loading) {
    return (
      <div className="dashboard-with-sidebar">
        <Sidebar user={user} />
        <div className="dashboard-main-content">
          <div className="loading-state">Loading tournament details...</div>
        </div>
      </div>
    );
  }

  if (error && !tournament) {
    return (
      <div className="dashboard-with-sidebar">
        <Sidebar user={user} />
        <div className="dashboard-main-content">
          <div className="error-state">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-with-sidebar">
      <Sidebar user={user} />
      
      <div className="dashboard-main-content">
        <div className="tournament-detail-container">
          {/* Header */}
          <div className="tournament-detail-header">
            <h1>Tournament Details</h1>
          </div>

          {/* Tournament Hero */}
          <div className="tournament-hero">
            <div className="tournament-hero-content">
              <div className="tournament-badges">
                <span className="format-badge">{tournament.tournament_format}</span>
                <span className="status-badge">{tournament.status}</span>
              </div>
              <h1>{tournament.title}</h1>
              <p className="tournament-subtitle">{tournament.description}</p>
              
              <div className="tournament-meta-row">
                <div className="meta-item">
                  <span className="meta-icon">
                    <span className="material-icons">location_on</span>
                  </span>
                  <span>{tournament.location}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  <span>{formatDate(tournament.start_date)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">
                    <span className="material-icons">person</span>
                  </span>
                  <span>Organized by {tournament.organizer_name}</span>
                </div>
              </div>

              {canRegister() && (
                <button
                  className="btn-register-hero"
                  onClick={() => setShowRegisterModal(true)}
                >
                  Register Your Team
                </button>
              )}

              {alreadyRegistered && (
                <div className="already-registered-badge">
                  <span className="material-icons">check_circle</span> You have already registered for this tournament
                </div>
              )}

              {!isRegistrationOpen() && (
                <div className="registration-closed-badge">
                  Registration Closed
                </div>
              )}

              {isTournamentFull() && (
                <div className="tournament-full-badge">
                  Tournament Full
                </div>
              )}
            </div>
          </div>

          {/* Tournament Details Grid */}
          <div className="tournament-details-grid">
            {/* Left Column */}
            <div className="details-column">
              {/* Important Dates */}
              <div className="detail-card">
                <h2>📅 Important Dates</h2>
                <div className="detail-list">
                  <div className="detail-item">
                    <span className="detail-label">Start Date:</span>
                    <span className="detail-value">{formatDate(tournament.start_date)}</span>
                  </div>
                  {tournament.end_date && (
                    <div className="detail-item">
                      <span className="detail-label">End Date:</span>
                      <span className="detail-value">{formatDate(tournament.end_date)}</span>
                    </div>
                  )}
                  {tournament.registration_deadline && (
                    <div className="detail-item">
                      <span className="detail-label">Registration Deadline:</span>
                      <span className="detail-value">{formatDate(tournament.registration_deadline)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Registration Info */}
              <div className="detail-card">
                <h2>
                  <span className="material-icons">edit</span> Registration Information
                </h2>
                <div className="detail-list">
                  {tournament.max_teams && (
                    <div className="detail-item">
                      <span className="detail-label">Teams Registered:</span>
                      <span className="detail-value">
                        {registrations.length} / {tournament.max_teams}
                      </span>
                    </div>
                  )}
                  {tournament.entry_fee && (
                    <div className="detail-item">
                      <span className="detail-label">Entry Fee:</span>
                      <span className="detail-value">{tournament.entry_fee}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Prize Details */}
              {tournament.prize_details && (
                <div className="detail-card">
                  <h2>
                    <span className="material-icons">emoji_events</span> Prizes
                  </h2>
                  <div className="detail-content">
                    {tournament.prize_details}
                  </div>
                </div>
              )}

              {/* Rules */}
              {tournament.rules && (
                <div className="detail-card">
                  <h2>📋 Rules & Regulations</h2>
                  <div className="detail-content">
                    {tournament.rules}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="details-column">
              {/* Contact Information */}
              <div className="detail-card">
                <h2>📞 Contact Information</h2>
                <div className="detail-content">
                  {tournament.contact_info}
                </div>
              </div>

              {/* Registered Teams */}
              <div className="detail-card">
                <h2>👥 Registered Teams ({registrations.length})</h2>
                {registrations.length === 0 ? (
                  <p className="no-teams">No teams registered yet. Be the first!</p>
                ) : (
                  <div className="teams-list">
                    {registrations.map((reg, index) => (
                      <div key={reg.id} className="team-item">
                        <div className="team-number">#{index + 1}</div>
                        <div className="team-info">
                          <div className="team-name">{reg.team_name}</div>
                          <div className="team-captain">
                            Captain: {reg.captain_name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Register Your Team</h2>
            <p>Fill in the details to register for {tournament.title}</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleRegister} className="registration-form">
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  name="team_name"
                  value={formData.team_name}
                  onChange={handleChange}
                  placeholder="Enter your team name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Email *</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="+977 9800000000"
                />
              </div>

              <div className="form-group">
                <label>Team Size</label>
                <input
                  type="number"
                  name="team_size"
                  value={formData.team_size}
                  onChange={handleChange}
                  placeholder="Number of players"
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Additional Information</label>
                <textarea
                  name="additional_info"
                  value={formData.additional_info}
                  onChange={handleChange}
                  placeholder="Any additional information about your team..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowRegisterModal(false)}
                  disabled={registering}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={registering}
                >
                  {registering ? 'Registering...' : 'Register Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
