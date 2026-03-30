import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { opportunitiesAPI } from '../services/api';
import Sidebar from './Sidebar';
import '../styles/opportunity-detail.css';

export default function OpportunityDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadOpportunity();
  }, [id]);

  const loadOpportunity = async () => {
    try {
      setLoading(true);
      const data = await opportunitiesAPI.getById(id);
      setOpportunity(data);
    } catch (err) {
      setError('Failed to load opportunity');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');
    setApplying(true);

    try {
      await opportunitiesAPI.apply(id, coverLetter);
      setSuccess('Application submitted successfully!');
      setTimeout(() => navigate('/applications'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="dashboard-with-sidebar">
        <Sidebar user={user} />
        <div className="dashboard-main-content">
          <div className="loading-container">Loading...</div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="dashboard-with-sidebar">
        <Sidebar user={user} />
        <div className="dashboard-main-content">
          <div className="error-container">Opportunity not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-with-sidebar">
      <Sidebar user={user} />
      <div className="dashboard-main-content">
        <div className="opportunity-detail-container">

      <div className="opportunity-detail-card">
        <div className="opportunity-header">
          <div>
            <div className="badges">
              <span className="opportunity-type-badge">{opportunity.opportunity_type}</span>
              {opportunity.is_expired && <span className="expired-badge">Expired</span>}
            </div>
            <h1>{opportunity.title}</h1>
            <p className="scout-info">Posted by {opportunity.scout_name}</p>
          </div>
        </div>

        <div className="opportunity-content">
          <section className="detail-section">
            <h3>Description</h3>
            <p>{opportunity.description}</p>
          </section>

          <section className="detail-section">
            <h3>Details</h3>
            <div className="details-grid">
              {opportunity.position && (
                <div className="detail-row">
                  <span className="detail-label">Position:</span>
                  <span className="detail-value">{opportunity.position}</span>
                </div>
              )}
              {opportunity.location && (
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{opportunity.location}</span>
                </div>
              )}
              {opportunity.age_range && (
                <div className="detail-row">
                  <span className="detail-label">Age Range:</span>
                  <span className="detail-value">{opportunity.age_range}</span>
                </div>
              )}
              {opportunity.experience_level && (
                <div className="detail-row">
                  <span className="detail-label">Experience Level:</span>
                  <span className="detail-value">{opportunity.experience_level}</span>
                </div>
              )}
              {opportunity.deadline && (
                <div className="detail-row">
                  <span className="detail-label">Deadline:</span>
                  <span className="detail-value">{formatDate(opportunity.deadline)}</span>
                </div>
              )}
            </div>
          </section>

          {opportunity.requirements && (
            <section className="detail-section">
              <h3>Requirements</h3>
              <p>{opportunity.requirements}</p>
            </section>
          )}

          {opportunity.benefits && (
            <section className="detail-section">
              <h3>Benefits</h3>
              <p>{opportunity.benefits}</p>
            </section>
          )}

          {(opportunity.contact_name || opportunity.contact_email || opportunity.contact_phone) && (
            <section className="detail-section contact-section">
              <h3>Contact Information</h3>
              <div className="contact-info">
                {opportunity.contact_name && (
                  <div className="contact-item">
                    <span className="contact-icon">
                      <span className="material-icons">person</span>
                    </span>
                    <div>
                      <div className="contact-label">Name</div>
                      <div className="contact-value">{opportunity.contact_name}</div>
                    </div>
                  </div>
                )}
                {opportunity.contact_email && (
                  <div className="contact-item">
                    <span className="contact-icon">
                      <span className="material-icons">email</span>
                    </span>
                    <div>
                      <div className="contact-label">Email</div>
                      <div className="contact-value">
                        <a href={`mailto:${opportunity.contact_email}`}>{opportunity.contact_email}</a>
                      </div>
                    </div>
                  </div>
                )}
                {opportunity.contact_phone && (
                  <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <div>
                      <div className="contact-label">Phone</div>
                      <div className="contact-value">
                        <a href={`tel:${opportunity.contact_phone}`}>{opportunity.contact_phone}</a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      {user.role === 'player' && !opportunity.is_expired && (
        <div className="application-form-card">
          <h2>Apply for this Opportunity</h2>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleApply}>
            <div className="form-group">
              <label>Cover Letter (Optional)</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell the scout why you're interested and what makes you a good fit..."
                rows="6"
              />
            </div>

            <button
              type="submit"
              className="btn-apply-full"
              disabled={applying}
            >
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      )}

      {user.role === 'player' && opportunity.is_expired && (
        <div className="expired-notice">
          <p>⏰ This opportunity has expired and is no longer accepting applications.</p>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
