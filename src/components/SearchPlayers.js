import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';
import '../styles/search-players.css';

export default function SearchPlayers({ user }) {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    position: '',
    batting_style: '',
    bowling_style: '',
    height: ''
  });

  const searchPlayers = async () => {
    try {
      setLoading(true);
      setHasSearched(true);
      setHasSearched(true);
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      const data = await profileAPI.searchPlayers(activeFilters);
      setPlayers(data);
    } catch (error) {
      console.error('Error searching players:', error);
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
    searchPlayers();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      position: '',
      batting_style: '',
      bowling_style: '',
      height: ''
    });
    setHasSearched(false);
    setPlayers([]);
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    return age;
  };

  return (
    <div className="search-players-wrapper">
      <div className="search-players-container">
          <div className="search-header">
            <h1>Search Players</h1>
            <p>Find cricket players based on their profile and skills</p>
          </div>

          <form onSubmit={handleSearch} className="search-filters">
            <div className="name-search-section">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by name..."
                className="name-search-input"
              />
            </div>

            <div className="cricket-info-section">
              <h3 className="section-title">Cricket Information</h3>
              
              <div className="cricket-filters-grid">
                <div className="filter-group">
                  <label>Primary Role</label>
                  <select name="position" value={filters.position} onChange={handleFilterChange}>
                    <option value="">Select Role</option>
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-rounder">All-rounder</option>
                    <option value="Wicket-keeper">Wicket-keeper</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Batting Style</label>
                  <select 
                    name="batting_style" 
                    value={filters.batting_style} 
                    onChange={handleFilterChange}
                  >
                    <option value="">Any</option>
                    <option value="Right-handed">Right-handed</option>
                    <option value="Left-handed">Left-handed</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Bowling Style</label>
                  <select 
                    name="bowling_style" 
                    value={filters.bowling_style} 
                    onChange={handleFilterChange}
                  >
                    <option value="">Any</option>
                    <option value="Right-arm Fast">Right-arm Fast</option>
                    <option value="Left-arm Fast">Left-arm Fast</option>
                    <option value="Right-arm Medium">Right-arm Medium</option>
                    <option value="Left-arm Medium">Left-arm Medium</option>
                    <option value="Right-arm Spin">Right-arm Spin</option>
                    <option value="Left-arm Spin">Left-arm Spin</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={filters.height}
                    onChange={handleFilterChange}
                    placeholder="e.g., 175"
                    min="140"
                    max="220"
                  />
                </div>
              </div>

              <div className="search-actions">
                <button type="submit" className="btn-search" disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </button>
                <button type="button" className="btn-clear" onClick={clearFilters}>
                  Clear
                </button>
              </div>
            </div>
          </form>

          <div className="results-section">
            {!hasSearched ? (
              <div className="landing-state">
                <div className="landing-icon">
                  <span className="material-icons">search</span>
                </div>
                <h2>Search for Cricket Players</h2>
                <p>Use the filters above to find players by position, batting style, bowling style, and height.</p>
                <p className="landing-hint">Select your criteria and click "Search" to get started.</p>
              </div>
            ) : (
              <>
                <div className="results-header">
                  <h2>Results</h2>
                  <span className="results-count">{players.length} players found</span>
                </div>

                {loading ? (
                  <div className="loading">Searching players...</div>
                ) : players.length === 0 ? (
                  <div className="no-results">
                    <p>No players found matching your criteria</p>
                    <button className="btn-clear" onClick={clearFilters}>Clear Filters</button>
                  </div>
                ) : (
                  <div className="players-grid">
                    {players.map((player) => (
                  <div key={player.user_id} className="player-card" onClick={() => navigate(`/profile/${player.user_id}`)}>
                    <div className="player-avatar">
                      {player.profile_picture ? (
                        <img src={player.profile_picture} alt={player.full_name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {(player.full_name || player.name || 'P')[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="player-info">
                      <h3>{player.full_name || player.name}</h3>
                      {player.location && (
                        <p className="player-location">
                          <span className="material-icons">location_on</span> {player.location}
                        </p>
                      )}
                    </div>

                    <div className="player-details">
                      {player.position && (
                        <div className="detail-badge">{player.position}</div>
                      )}
                      {player.batting_style && (
                        <div className="detail-item">
                          <span className="detail-label">Batting:</span>
                          <span className="detail-value">{player.batting_style}</span>
                        </div>
                      )}
                      {player.bowling_style && (
                        <div className="detail-item">
                          <span className="detail-label">Bowling:</span>
                          <span className="detail-value">{player.bowling_style}</span>
                        </div>
                      )}
                      {player.height && (
                        <div className="detail-item">
                          <span className="detail-label">Height:</span>
                          <span className="detail-value">{player.height} cm</span>
                        </div>
                      )}
                      {player.date_of_birth && (
                        <div className="detail-item">
                          <span className="detail-label">Age:</span>
                          <span className="detail-value">{calculateAge(player.date_of_birth)} years</span>
                        </div>
                      )}
                    </div>

                    <button className="btn-view-profile">View Profile</button>
                  </div>
                ))}
              </div>
            )}
              </>
            )}
          </div>
        </div>
    </div>
  );
}
