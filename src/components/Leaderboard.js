import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';
import '../styles/leaderboard.css';

export default function Leaderboard({ user }) {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('all');

  useEffect(() => {
    loadLeaderboard();
  }, [selectedSport]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const sport = selectedSport === 'all' ? null : selectedSport;
      const data = await profileAPI.getLeaderboard(sport);
      setPlayers(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <div className="leaderboard-title-section">
          <h1>Player Leaderboard</h1>
          <p>Top players ranked by profile views (most searched)</p>
        </div>
        
        <div className="leaderboard-filters">
          <select 
            value={selectedSport} 
            onChange={(e) => setSelectedSport(e.target.value)}
            className="sport-filter"
          >
            <option value="all">All Sports</option>
            <option value="Cricket">Cricket</option>
            <option value="Football">Football</option>
            <option value="Basketball">Basketball</option>
            <option value="Volleyball">Volleyball</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      ) : players.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <span className="material-icons">leaderboard</span>
          </div>
          <h3>No Players Found</h3>
          <p>Be the first to join the leaderboard</p>
        </div>
      ) : (
        <div className="leaderboard-container">
          {/* Top 3 Podium */}
          {players.length >= 3 && (
            <div className="podium">
              {/* 2nd Place */}
              <div className="podium-item podium-second" onClick={() => navigate(`/profile/${players[1].user_id}`)}>
                <div className="podium-rank">🥈</div>
                <div className="podium-avatar">
                  {players[1].profile_picture ? (
                    <img src={players[1].profile_picture} alt={players[1].full_name} />
                  ) : (
                    <div className="avatar-placeholder">
                      <span className="material-icons">person</span>
                    </div>
                  )}
                </div>
                <h3 className="podium-name">{players[1].full_name || players[1].name || 'Player'}</h3>
                <p className="podium-sport">{players[1].primary_sport || 'Athlete'}</p>
                <div className="podium-stats">
                  <span className="material-icons">visibility</span>
                  <span>{players[1].profile_views || 0}</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="podium-item podium-first" onClick={() => navigate(`/profile/${players[0].user_id}`)}>
                <div className="podium-rank">🥇</div>
                <div className="podium-avatar">
                  {players[0].profile_picture ? (
                    <img src={players[0].profile_picture} alt={players[0].full_name} />
                  ) : (
                    <div className="avatar-placeholder">
                      <span className="material-icons">person</span>
                    </div>
                  )}
                </div>
                <h3 className="podium-name">{players[0].full_name || players[0].name || 'Player'}</h3>
                <p className="podium-sport">{players[0].primary_sport || 'Athlete'}</p>
                <div className="podium-stats">
                  <span className="material-icons">visibility</span>
                  <span>{players[0].profile_views || 0}</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="podium-item podium-third" onClick={() => navigate(`/profile/${players[2].user_id}`)}>
                <div className="podium-rank">🥉</div>
                <div className="podium-avatar">
                  {players[2].profile_picture ? (
                    <img src={players[2].profile_picture} alt={players[2].full_name} />
                  ) : (
                    <div className="avatar-placeholder">
                      <span className="material-icons">person</span>
                    </div>
                  )}
                </div>
                <h3 className="podium-name">{players[2].full_name || players[2].name || 'Player'}</h3>
                <p className="podium-sport">{players[2].primary_sport || 'Athlete'}</p>
                <div className="podium-stats">
                  <span className="material-icons">visibility</span>
                  <span>{players[2].profile_views || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="rankings-table">
            <div className="table-header">
              <div className="col-rank">Rank</div>
              <div className="col-player">Player</div>
              <div className="col-sport">Sport</div>
              <div className="col-location">Location</div>
              <div className="col-stats">Views</div>
              <div className="col-stats">Likes</div>
              <div className="col-stats">Videos</div>
            </div>
            
            <div className="table-body">
              {players.map((player, index) => (
                <div 
                  key={player.user_id} 
                  className={`table-row ${index < 3 ? 'top-three' : ''} ${player.user_id === user.id ? 'current-user' : ''}`}
                  onClick={() => navigate(`/profile/${player.user_id}`)}
                >
                  <div className="col-rank">
                    <span className="rank-number">{getMedalIcon(index + 1)}</span>
                  </div>
                  <div className="col-player">
                    <div className="player-info">
                      <div className="player-avatar-small">
                        {player.profile_picture ? (
                          <img src={player.profile_picture} alt={player.full_name} />
                        ) : (
                          <div className="avatar-placeholder-small">
                            <span className="material-icons">person</span>
                          </div>
                        )}
                      </div>
                      <div className="player-details">
                        <div className="player-name">{player.full_name || player.name || 'Player'}</div>
                        {player.current_team && (
                          <div className="player-team">{player.current_team}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-sport">
                    <span className="sport-badge">{player.primary_sport || 'N/A'}</span>
                  </div>
                  <div className="col-location">
                    {player.district || player.location || 'N/A'}
                  </div>
                  <div className="col-stats">
                    <span className="stat-value">{player.profile_views || 0}</span>
                  </div>
                  <div className="col-stats">
                    <span className="stat-value">{player.total_likes || 0}</span>
                  </div>
                  <div className="col-stats">
                    <span className="stat-value">{player.total_videos || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
