import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/admin-tournaments.css';

export default function AdminTournaments({ user }) {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/tournaments/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        }
      });
      const data = await response.json();
      setTournaments(data);
    } catch (err) {
      console.error('Error loading tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tournamentId) => {
    if (!window.confirm('Are you sure you want to approve this tournament?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/tournaments/${tournamentId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        }
      });

      if (response.ok) {
        alert('Tournament approved successfully!');
        loadTournaments();
      } else {
        alert('Failed to approve tournament');
      }
    } catch (err) {
      console.error('Error approving tournament:', err);
      alert('Error approving tournament');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/tournaments/${selectedTournament.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (response.ok) {
        alert('Tournament rejected');
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedTournament(null);
        loadTournaments();
      } else {
        alert('Failed to reject tournament');
      }
    } catch (err) {
      console.error('Error rejecting tournament:', err);
      alert('Error rejecting tournament');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (tournament) => {
    setSelectedTournament(tournament);
    setShowRejectModal(true);
  };

  const filteredTournaments = tournaments.filter(t => {
    if (filter === 'all') return true;
    return t.verification_status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Pending Review', class: 'status-pending' },
      approved: { label: 'Approved', class: 'status-approved' },
      rejected: { label: 'Rejected', class: 'status-rejected' }
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const pendingCount = tournaments.filter(t => t.verification_status === 'pending').length;
  const approvedCount = tournaments.filter(t => t.verification_status === 'approved').length;
  const rejectedCount = tournaments.filter(t => t.verification_status === 'rejected').length;

  return (
    <div className="dashboard-with-sidebar">
      <Sidebar user={user} />
      
      <div className="dashboard-main-content">
        <div className="admin-tournaments-container">
          <div className="admin-tournaments-header">
            <div>
              <h1>Tournament Management</h1>
              <p>Review and manage tournament submissions</p>
            </div>
          </div>

          {/* Stats */}
          <div className="tournament-stats">
            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <div className="stat-value">{pendingCount}</div>
                <div className="stat-label">Pending Review</div>
              </div>
            </div>
            <div className="stat-card approved">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <div className="stat-value">{approvedCount}</div>
                <div className="stat-label">Approved</div>
              </div>
            </div>
            <div className="stat-card rejected">
              <div className="stat-icon">❌</div>
              <div className="stat-info">
                <div className="stat-value">{rejectedCount}</div>
                <div className="stat-label">Rejected</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="tournament-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({tournaments.length})
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({pendingCount})
            </button>
            <button
              className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              Approved ({approvedCount})
            </button>
            <button
              className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({rejectedCount})
            </button>
          </div>

          {/* Tournaments List */}
          {loading ? (
            <div className="loading-state">Loading tournaments...</div>
          ) : filteredTournaments.length === 0 ? (
            <div className="empty-state">
              <p>No tournaments found</p>
            </div>
          ) : (
            <div className="tournaments-list">
              {filteredTournaments.map((tournament) => {
                const statusBadge = getStatusBadge(tournament.verification_status);
                return (
                  <div key={tournament.id} className="tournament-item">
                    <div className="tournament-main">
                      <div className="tournament-info">
                        <div className="tournament-title-row">
                          <h3>{tournament.title}</h3>
                          <span className={`status-badge ${statusBadge.class}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                        <p className="tournament-description">{tournament.description}</p>
                        <div className="tournament-meta">
                          <span className="meta-item">
                            <strong>Format:</strong> {tournament.tournament_format}
                          </span>
                          <span className="meta-item">
                            <strong>Location:</strong> {tournament.location}
                          </span>
                          <span className="meta-item">
                            <strong>Start Date:</strong> {formatDate(tournament.start_date)}
                          </span>
                          <span className="meta-item">
                            <strong>Organizer:</strong> {tournament.organizer_name} ({tournament.organizer_role})
                          </span>
                        </div>
                        {tournament.rejection_reason && (
                          <div className="rejection-reason">
                            <strong>Rejection Reason:</strong> {tournament.rejection_reason}
                          </div>
                        )}
                      </div>
                      
                      {tournament.verification_status === 'pending' && (
                        <div className="tournament-actions">
                          <button
                            className="btn-approve"
                            onClick={() => handleApprove(tournament.id)}
                            disabled={actionLoading}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => openRejectModal(tournament)}
                            disabled={actionLoading}
                          >
                            ✗ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Reject Tournament</h2>
            <p>Please provide a reason for rejecting "{selectedTournament?.title}"</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows="4"
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-reject"
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
