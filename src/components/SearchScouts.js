import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';
import '../styles/search-scouts.css';

export default function SearchScouts({ user }) {
  const navigate = useNavigate();
  const [scouts, setScouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    organization: '',
    location: ''
  });

  useEffect(() => {
    searchScouts();
  }, []);

  const searchScouts = async () => {
    try {
      setLoading(true);
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      const data = await profileAPI.searchScouts(activeFilters);
      setScouts(data);
    } catch (error) {
      console.error('Error searching scouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchScouts();
  };

  const handleReset = () => {
    setFilters({
      search: '',
      organization: '',
      location: ''
    });
    setTimeout(() => searchScouts(), 100);
  };

  return (
    <div className="search-scouts">
      <div className="search-scouts-header">
        <h1>Find Scouts</h1>
        <p>Connect with scouts and expand your network</p>
      </div>

      <div className="search-scouts-container">
        {/* Filters */}
        <div className="search-scouts-filters">
          <form onSubmit={handleSearch}>
            <div className="filter-group">
              <label>Search by Name</label>
              <input
                type="text"
                name="search"
                placeholder="Scout name..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label>Organization</label>
              <input
                type="text"
                name="organization"
                placeholder="Organization name..."
                value={filters.organization}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                placeholder="City, district, or province..."
                value={filters.location}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-actions">
              <button type="submit" className="btn-search">
                <span className="material-icons">search</span>
                Search
              </button>
              <button type="button" className="btn-reset" onClick={handleReset}>
                <span className="material-icons">refresh</span>
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="search-scouts-results">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading scouts...</p>
            </div>
          ) : scouts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <span className="material-icons">person_search</span>
              </div>
              <h3>No Scouts Found</h3>
              <p>Try adjusting your search filters</p>
            </div>
          ) : (
            <>
              <div className="results-header">
                <h2>Found {scouts.length} Scout{scouts.length !== 1 ? 's' : ''}</h2>
              </div>
              
              <div className="scouts-grid">
                {scouts.map((scout) => (
                  <div 
                    key={scout.user_id} 
                    className="scout-card"
                    onClick={() => navigate(`/profile/${scout.user_id}`)}
                  >
                    <div className="scout-card-header">
                      <div className="scout-avatar">
                        {scout.profile_picture ? (
                          <img src={scout.profile_picture} alt={scout.full_name} />
                        ) : (
                          <div className="scout-avatar-placeholder">
                            <span className="material-icons">person</span>
                          </div>
                        )}
                      </div>
                      <div className="scout-info">
                        <h3 className="scout-name">{scout.full_name || scout.name || 'Scout User'}</h3>
                        <p className="scout-org">{scout.organization || 'Cricket Scout'}</p>
                      </div>
                    </div>
                    
                    <div className="scout-card-body">
                      {scout.location && (
                        <div className="scout-detail">
                          <span className="material-icons">location_on</span>
                          <span>{scout.location}</span>
                        </div>
                      )}
                      {scout.years_experience && (
                        <div className="scout-detail">
                          <span className="material-icons">work</span>
                          <span>{scout.years_experience} years experience</span>
                        </div>
                      )}
                      {scout.specialization && scout.specialization.length > 0 && (
                        <div className="scout-detail">
                          <span className="material-icons">sports</span>
                          <span>{scout.specialization.join(', ')}</span>
                        </div>
                      )}
                      {scout.bio && (
                        <p className="scout-bio">{scout.bio.substring(0, 100)}{scout.bio.length > 100 ? '...' : ''}</p>
                      )}
                    </div>
                    
                    <div className="scout-card-footer">
                      <button 
                        className="btn-view-profile"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${scout.user_id}`);
                        }}
                      >
                        View Profile
                      </button>
                      <button 
                        className="btn-message"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/messages');
                        }}
                      >
                        <span className="material-icons">message</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
