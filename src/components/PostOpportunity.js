import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { opportunitiesAPI } from '../services/api';
import '../styles/post-opportunity.css';

export default function PostOpportunity({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    opportunity_type: 'trial',
    position: '',
    location: '',
    age_range: '',
    experience_level: '',
    requirements: '',
    benefits: '',
    deadline: '',
    contact_name: '',
    contact_email: '',
    contact_phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const opportunity = await opportunitiesAPI.create(formData);
      // Redirect to the opportunity detail page after successful creation
      navigate(`/opportunities/${opportunity.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post opportunity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-opportunity-wrapper">
      <div className="post-opportunity-container">
          <div className="post-opportunity-header">
            <h1>Post New Opportunity</h1>
            <p>Create an opportunity to discover talented cricket players</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="opportunity-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., U-19 Cricket Team Trial"
              required
            />
          </div>

          <div className="form-group">
            <label>Opportunity Type *</label>
            <select
              name="opportunity_type"
              value={formData.opportunity_type}
              onChange={handleChange}
              required
            >
              <option value="trial">Trial</option>
              <option value="training">Training Program</option>
              <option value="scholarship">Scholarship</option>
              <option value="contract">Contract Offer</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the opportunity in detail..."
              rows="5"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Requirements</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Position</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
              >
                <option value="">Any Position</option>
                <option value="Batsman">Batsman</option>
                <option value="Bowler">Bowler</option>
                <option value="All-rounder">All-rounder</option>
                <option value="Wicket-keeper">Wicket-keeper</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age Range</label>
              <input
                type="text"
                name="age_range"
                value={formData.age_range}
                onChange={handleChange}
                placeholder="e.g., 16-19"
              />
            </div>

            <div className="form-group">
              <label>Experience Level</label>
              <select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
              >
                <option value="">Any Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="professional">Professional</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Specific Requirements</label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="List any specific requirements or qualifications..."
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Contact Information</h3>
          
          <div className="form-group">
            <label>Contact Name *</label>
            <input
              type="text"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              placeholder="Your name or organization name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contact Email *</label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="contact@example.com"
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
                placeholder="+977 98XXXXXXXX"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Details</h3>
          
          <div className="form-group">
            <label>Benefits</label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              placeholder="What benefits or compensation are offered?"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Application Deadline</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post Opportunity'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
