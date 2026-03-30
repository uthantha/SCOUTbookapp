import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { opportunitiesAPI } from '../services/api';
import '../styles/opportunities.css';

export default function Opportunities({ user }) {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadOpportunities();
  }, [filter]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const data = await opportunitiesAPI.getAll(filter ? { opportunity_type: filter } : {});
      setOpportunities(data);
    } catch (err) {
      setError('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="opportunities-wrapper">
      <div className="opportunities-container">
      <div className="opportunities-header">
        <h1>Browse Opportunities</h1>
        <p>Find trials, training programs, scholarships, and contracts</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="opportunities-filters">
        <button
          className={`filter-btn ${filter === '' ? 'active' : ''}`}
          onClick={() => setFilter('')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'trial' ? 'active' : ''}`}
          onClick={() => setFilter('trial')}
        >
          Trials
        </button>
        <button
          className={`filter-btn ${filter === 'training' ? 'active' : ''}`}
          onClick={() => setFilter('training')}
        >
          Training
        </button>
        <button
          className={`filter-btn ${filter === 'scholarship' ? 'active' : ''}`}
          onClick={() => setFilter('scholarship')}
        >
          Scholarships
        </button>
        <button
          className={`filter-btn ${filter === 'contract' ? 'active' : ''}`}
          onClick={() => setFilter('contract')}
        >
          Contracts
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading opportunities...</div>
      ) : opportunities.length === 0 ? (
        <div className="empty-state">
          <p>No opportunities available at the moment.</p>
          <p>Check back soon!</p>
        </div>
      ) : (
        <div className="opportunities-grid">
          {opportunities.map((opp) => (
            <div key={opp.id} className="opportunity-card">
              <div className="opportunity-type-badge">{opp.opportunity_type}</div>
              <h3>{opp.title}</h3>
              <p className="opportunity-description">{opp.description}</p>
              
              <div className="opportunity-details">
                {opp.position && (
                  <div className="detail-item">
                    <span className="detail-icon">
                      <span className="material-icons">sports_cricket</span>
                    </span>
                    <span>{opp.position}</span>
                  </div>
                )}
                {opp.location && (
                  <div className="detail-item">
                    <span className="detail-icon">
                      <span className="material-icons">location_on</span>
                    </span>
                    <span>{opp.location}</span>
                  </div>
                )}
                {opp.age_range && (
                  <div className="detail-item">
                    <span className="detail-icon">
                      <span className="material-icons">person</span>
                    </span>
                    <span>Age: {opp.age_range}</span>
                  </div>
                )}
                {opp.deadline && (
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <span>Deadline: {formatDate(opp.deadline)}</span>
                  </div>
                )}
              </div>

              <div className="opportunity-footer">
                <span className="scout-name">By {opp.scout_name}</span>
                <button
                  className="btn-apply"
                  onClick={() => navigate(`/opportunities/${opp.id}`)}
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
  );
}
