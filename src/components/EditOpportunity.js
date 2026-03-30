import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { opportunitiesAPI } from '../services/api';
import Sidebar from './Sidebar';
import '../styles/post-opportunity.css';

export default function EditOpportunity({ user }) {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadOpportunity();
  }, [id]);

  const loadOpportunity = async () => {
    try {
      setLoadingData(true);
      const data = await opportunitiesAPI.getById(id);
      
      // Format deadline for input field
      const formattedDeadline = data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '';
      
      setFormData({
        title: data.title || '',
        description: data.description || '',
        opportunity_type: data.opportunity_type || 'trial',
        position: data.position || '',
        location: data.location || '',
        age_range: data.age_range || '',
        experience_level: data.experience_level || '',
        requirements: data.requirements || '',
        benefits: data.benefits || '',
        deadline: formattedDeadline,
        contact_name: data.contact_name || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || ''
      });
    } catch (err) {
      setError('Failed to load opportunity');
    } finally {
      setLoadingData(false);
    }
  };

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
      await opportunitiesAPI.update(id, formData);
      navigate('/opportunities/manage');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update opportunity');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="dashboard-with-sidebar">
        <Sidebar user={user} />
        <div className="dashboard-main-content">
          <div className="post-opportunity-container">
            <div className="loading">Loading opportunity...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-with-sidebar">
      <Sidebar user={user} />
      <div className="dashboard-main-content">
        <div className="post-opportunity-container">
          <div className="form-header">
            <h1>Edit Opportunity</h1>
            <p>Update the details of your opportunity</p>
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
                  required
                  placeholder="e.g., Cricket Academy Trial"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Describe the opportunity in detail..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Opportunity Type *</label>
                  <select
                    name="opportunity_type"
                    value={formData.opportunity_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="trial">Trial</option>
                    <option value="scholarship">Scholarship</option>
                    <option value="contract">Contract</option>
                    <option value="training">Training Program</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="e.g., Batsman, Bowler, All-rounder"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Details</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="City, Country"
                  />
                </div>

                <div className="form-group">
                  <label>Age Range</label>
                  <input
                    type="text"
                    name="age_range"
                    value={formData.age_range}
                    onChange={handleChange}
                    placeholder="e.g., 16-21"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Experience Level</label>
                  <select
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleChange}
                  >
                    <option value="">Select level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Application Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Requirements</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows="4"
                  placeholder="List the requirements for applicants..."
                />
              </div>

              <div className="form-group">
                <label>Benefits</label>
                <textarea
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  rows="4"
                  placeholder="What benefits does this opportunity offer?"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Contact Information</h3>
              
              <div className="form-group">
                <label>Contact Name</label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  placeholder="Your name or organization name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    placeholder="contact@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/opportunities/manage')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Opportunity'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
