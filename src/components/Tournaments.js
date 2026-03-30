import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentsAPI } from '../services/api';
import '../styles/tournaments.css';

export default function Tournaments({ user }) {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const [formData, setFormData] = useState({
    team_name: '',
    contact_email: user?.email || '',
    contact_phone: '',
    team_size: '',
    additional_info: ''
  });

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const data = await tournamentsAPI.getAll();
      setTournaments(data);
    } catch (err) {
      setError('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (tournament) => {
    setSelectedTournament(tournament);
    setShowDetailModal(true);
    
    // Load registrations
    try {
      const regs = await tournamentsAPI.getRegistrations(tournament.id);
      setRegistrations(regs);
    } catch (err) {
      console.error('Error loading registrations:', err);
    }

    // Check if already registered
    try {
      const myRegistrations = await tournamentsAPI.getMyRegistrations();
      const registered = myRegistrations.some(reg => reg.tournament_id === tournament.id);
      setAlreadyRegistered(registered);
    } catch (err) {
      console.error('Error checking registration:', err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegistering(true);

    try {
      await tournamentsAPI.register(selectedTournament.id, formData);
      alert('Team registered successfully!');
      setShowRegisterModal(false);
      setAlreadyRegistered(true);
      
      // Reload registrations
      const regs = await tournamentsAPI.getRegistrations(selectedTournament.id);
      setRegistrations(regs);
      
      // Reset form
      setFormData({
        team_name: '',
        contact_email: user?.email || '',
        contact_phone: '',
        team_size: '',
        additional_info: ''
      });
    } catch (err) {
      setRegisterError(err.response?.data?.error || 'Failed to register team');
    } finally {
      setRegistering(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatLongDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isRegistrationOpen = (tournament) => {
    if (!tournament) return false;
    if (tournament.registration_deadline) {
      return new Date(tournament.registration_deadline) > new Date();
    }
    return new Date(tournament.start_date) > new Date();
  };

  const isTournamentFull = (tournament) => {
    if (!tournament || !tournament.max_teams) return false;
    return registrations.length >= tournament.max_teams;
  };

  const canRegister = () => {
    return selectedTournament && 
           !alreadyRegistered && 
           isRegistrationOpen(selectedTournament) && 
           !isTournamentFull(selectedTournament);
  };

  const closeModals = () => {
    setShowDetailModal(false);
    setShowRegisterModal(false);
    setSelectedTournament(null);
    setRegistrations([]);
    setAlreadyRegistered(false);
    setRegisterError('');
  };

  return (
    <div className="tournaments-wrapper">
      <div className="tournaments-container">
        <div className="tournaments-container">
          <div className="tournaments-header">
            <div className="header-content">
              <div>
                <h1>Cricket Tournaments</h1>
                <p>Discover and participate in cricket tournaments</p>
              </div>
              <button className="btn-primary" onClick={() => navigate('/tournaments/create')}>
                + Create Tournament
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading tournaments...</div>
          ) : tournaments.length === 0 ? (
            <div className="empty-state">
              <p>No tournaments available yet.</p>
              <button className="btn-primary" onClick={() => navigate('/tournaments/create')}>
                Create First Tournament
              </button>
            </div>
          ) : (
            <div className="tournaments-grid">
              {tournaments.map((tournament) => (
                <div key={tournament.id} className="tournament-card">
                  <div className="tournament-header">
                    <span className="tournament-format-badge">{tournament.tournament_format}</span>
                    <span className="tournament-status">{tournament.status}</span>
                  </div>
                  <h3>{tournament.title}</h3>
                  <p className="tournament-description">{tournament.description}</p>
                  
                  <div className="tournament-details">
                    <div className="detail-item">
                      <span className="detail-icon">
                        <span className="material-icons">location_on</span>
                      </span>
                      <span>{tournament.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span>{formatDate(tournament.start_date)}</span>
                    </div>
                    {tournament.max_teams && (
                      <div className="detail-item">
                        <span className="detail-icon">👥</span>
                        <span>{tournament.registration_count || 0}/{tournament.max_teams} teams</span>
                      </div>
                    )}
                  </div>

                  <div className="tournament-footer">
                    <span className="organizer-name">By {tournament.organizer_name}</span>
                    <button
                      className="btn-view"
                      onClick={() => handleViewDetails(tournament)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tournament Detail Modal */}
      {showDetailModal && selectedTournament && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModals}>×</button>
            
            <div className="modal-header">
              <div className="modal-badges">
                <span className="format-badge">{selectedTournament.tournament_format}</span>
                <span className="status-badge-modal">{selectedTournament.status}</span>
              </div>
              <h2>{selectedTournament.title}</h2>
              <p className="modal-subtitle">{selectedTournament.description}</p>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h3>📅 Important Dates</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Start Date:</span>
                    <span className="info-value">{formatLongDate(selectedTournament.start_date)}</span>
                  </div>
                  {selectedTournament.end_date && (
                    <div className="info-item">
                      <span className="info-label">End Date:</span>
                      <span className="info-value">{formatLongDate(selectedTournament.end_date)}</span>
                    </div>
                  )}
                  {selectedTournament.registration_deadline && (
                    <div className="info-item">
                      <span className="info-label">Registration Deadline:</span>
                      <span className="info-value">{formatLongDate(selectedTournament.registration_deadline)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-section">
                <h3>
                  <span className="material-icons">edit</span> Registration Information
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Location:</span>
                    <span className="info-value">{selectedTournament.location}</span>
                  </div>
                  {selectedTournament.max_teams && (
                    <div className="info-item">
                      <span className="info-label">Teams Registered:</span>
                      <span className="info-value">{registrations.length} / {selectedTournament.max_teams}</span>
                    </div>
                  )}
                  {selectedTournament.entry_fee && (
                    <div className="info-item">
                      <span className="info-label">Entry Fee:</span>
                      <span className="info-value">{selectedTournament.entry_fee}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedTournament.prize_details && (
                <div className="modal-section">
                  <h3>
                    <span className="material-icons">emoji_events</span> Prizes
                  </h3>
                  <p className="section-content">{selectedTournament.prize_details}</p>
                </div>
              )}

              {selectedTournament.rules && (
                <div className="modal-section">
                  <h3>📋 Rules & Regulations</h3>
                  <p className="section-content">{selectedTournament.rules}</p>
                </div>
              )}

              {selectedTournament.contact_info && (
                <div className="modal-section">
                  <h3>📞 Contact Information</h3>
                  <p className="section-content">{selectedTournament.contact_info}</p>
                </div>
              )}

              <div className="modal-section">
                <h3>👥 Registered Teams ({registrations.length})</h3>
                {registrations.length === 0 ? (
                  <p className="no-teams">No teams registered yet. Be the first!</p>
                ) : (
                  <div className="teams-list-modal">
                    {registrations.map((reg, index) => (
                      <div key={reg.id} className="team-item-modal">
                        <span className="team-number">#{index + 1}</span>
                        <span className="team-name">{reg.team_name}</span>
                        <span className="team-captain">Captain: {reg.captain_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              {canRegister() && (
                <button
                  className="btn-register"
                  onClick={() => setShowRegisterModal(true)}
                >
                  Register Your Team
                </button>
              )}
              {alreadyRegistered && (
                <div className="already-registered">
                  <span className="material-icons">check_circle</span> You have already registered for this tournament
                </div>
              )}
              {!isRegistrationOpen(selectedTournament) && !alreadyRegistered && (
                <div className="registration-closed">
                  Registration Closed
                </div>
              )}
              {isTournamentFull(selectedTournament) && !alreadyRegistered && (
                <div className="tournament-full">
                  Tournament Full
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowRegisterModal(false)}>×</button>
            <h2>Register Your Team</h2>
            <p>Fill in the details to register for {selectedTournament?.title}</p>

            {registerError && <div className="error-message">{registerError}</div>}

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
