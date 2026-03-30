import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { opportunitiesAPI } from '../services/api';
import '../styles/manage-opportunities.css';

export default function ManageOpportunities({ user }) {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await opportunitiesAPI.getMyOpportunities();
      setOpportunities(data);
    } catch (err) {
      setError('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (opportunityId) => {
    try {
      setDeleting(true);
      setError('');
      console.log('Deleting opportunity:', opportunityId);
      await opportunitiesAPI.delete(opportunityId);
      console.log('Delete successful');
      setOpportunities(opportunities.filter(opp => opp.id !== opportunityId));
      setDeleteConfirm(null);
      setSuccess('Opportunity deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.error || 'Failed to delete opportunity. Please try again.');
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="manage-opportunities-wrapper">
      <div className="manage-opportunities-container">
      <div className="manage-header">
        <div className="header-content">
          <h1>My Opportunities</h1>
          <button className="btn-primary" onClick={() => navigate('/opportunities/create')}>
            + Post New Opportunity
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : opportunities.length === 0 ? (
        <div className="empty-state">
          <p>You haven't posted any opportunities yet.</p>
          <button className="btn-primary" onClick={() => navigate('/opportunities/create')}>
            Post Your First Opportunity
          </button>
        </div>
      ) : (
        <div className="opportunities-list">
          {opportunities.map((opp) => (
            <div key={opp.id} className={`opportunity-card ${opp.is_expired ? 'expired' : ''}`}>
              <div className="card-header">
                <div className="header-left">
                  <span className="opportunity-type-badge">{opp.opportunity_type}</span>
                  {opp.is_expired && <span className="expired-badge">Expired</span>}
                </div>
                <div className="applications-badge">
                  <span className="app-count">{opp.application_count || 0}</span>
                  <span className="app-label">Applications</span>
                </div>
              </div>

              <div className="card-body">
                <h3 className="opportunity-title">{opp.title}</h3>
                
                <div className="opportunity-details">
                  <div className="detail-row">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{opp.location || 'Not specified'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Posted:</span>
                    <span className="detail-value">{formatDate(opp.created_at)}</span>
                  </div>
                  {opp.deadline && (
                    <div className="detail-row">
                      <span className="detail-label">Deadline:</span>
                      <span className="detail-value">{formatDate(opp.deadline)}</span>
                    </div>
                  )}
                  {opp.position && (
                    <div className="detail-row">
                      <span className="detail-label">Position:</span>
                      <span className="detail-value">{opp.position}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="btn-action btn-view"
                  onClick={() => navigate(`/opportunities/${opp.id}`)}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </button>
                <button
                  className="btn-action btn-edit"
                  onClick={() => navigate(`/opportunities/${opp.id}/edit`)}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={() => setDeleteConfirm(opp.id)}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteConfirm(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon-circle">
              <svg className="trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
              </svg>
            </div>
            <h2 className="delete-modal-title">Want to Delete</h2>
            <p className="delete-modal-text">
              Are you sure want to delete this opportunity?<br />
              You will not able to recover them.
            </p>
            <div className="delete-modal-actions">
              <button
                className="btn-modal-delete"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                className="btn-modal-cancel"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
