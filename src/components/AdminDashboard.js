import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/admin-dashboard.css';

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlayers: 0,
    totalScouts: 0,
    totalOpportunities: 0,
    totalApplications: 0,
    totalTournaments: 0,
    activeUsers: 0,
    newUsersThisMonth: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.stats) {
        setStats(data.stats);
      }
      if (data.recentUsers) {
        setRecentUsers(data.recentUsers);
      }
      if (data.recentOpportunities) {
        setRecentOpportunities(data.recentOpportunities);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-with-sidebar">
      <Sidebar user={user} />
      
      <div className="dashboard-main-content">
        <div className="admin-dashboard-container">
          {/* Header */}
          <div className="admin-header">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Manage and monitor your ScoutBook platform</p>
            </div>
          </div>

          {loading ? (
            <div className="loading-state" style={{ padding: '64px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
              <p>Loading dashboard data...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="admin-stats-grid">
            <div className="admin-stat-card primary">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>

            <div className="admin-stat-card success">
              <div className="stat-icon">🏏</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalPlayers}</div>
                <div className="stat-label">Players</div>
              </div>
            </div>

            <div className="admin-stat-card warning">
              <div className="stat-icon">🔍</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalScouts}</div>
                <div className="stat-label">Scouts</div>
              </div>
            </div>

            <div className="admin-stat-card info">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalOpportunities}</div>
                <div className="stat-label">Opportunities</div>
              </div>
            </div>

            <div className="admin-stat-card purple">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalApplications}</div>
                <div className="stat-label">Applications</div>
              </div>
            </div>

            <div className="admin-stat-card orange">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalTournaments}</div>
                <div className="stat-label">Tournaments</div>
              </div>
            </div>

            <div className="admin-stat-card teal">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{stats.activeUsers}</div>
                <div className="stat-label">Active Users</div>
              </div>
            </div>

            <div className="admin-stat-card pink">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-value">{stats.newUsersThisMonth}</div>
                <div className="stat-label">New This Month</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="admin-quick-actions">
            <button className="admin-action-btn" onClick={() => navigate('/admin/users')}>
              <span className="action-icon">👥</span>
              <span>Manage Users</span>
            </button>
            <button className="admin-action-btn" onClick={() => navigate('/admin/opportunities')}>
              <span className="action-icon">🎯</span>
              <span>Manage Opportunities</span>
            </button>
            <button className="admin-action-btn" onClick={() => navigate('/admin/tournaments')}>
              <span className="action-icon">🏆</span>
              <span>Manage Tournaments</span>
            </button>
            <button className="admin-action-btn" onClick={() => navigate('/admin/reports')}>
              <span className="action-icon">📊</span>
              <span>View Reports</span>
            </button>
          </div>

          {/* Content Grid */}
          <div className="admin-content-grid">
            {/* Recent Users */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Recent Users</h3>
                <button className="view-all-link" onClick={() => navigate('/admin/users')}>
                  View All →
                </button>
              </div>
              <div className="admin-card-body">
                {loading ? (
                  <div className="loading-state">Loading...</div>
                ) : recentUsers.length === 0 ? (
                  <div className="empty-state">No users yet</div>
                ) : (
                  <div className="users-list">
                    {recentUsers.map((user) => (
                      <div key={user.id} className="user-item">
                        <div className="user-avatar">
                          {user.profile_picture ? (
                            <img src={user.profile_picture} alt={user.name} />
                          ) : (
                            <div className="avatar-placeholder">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="user-info">
                          <div className="user-name">{user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Opportunities */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Recent Opportunities</h3>
                <button className="view-all-link" onClick={() => navigate('/admin/opportunities')}>
                  View All →
                </button>
              </div>
              <div className="admin-card-body">
                {loading ? (
                  <div className="loading-state">Loading...</div>
                ) : recentOpportunities.length === 0 ? (
                  <div className="empty-state">No opportunities yet</div>
                ) : (
                  <div className="opportunities-list">
                    {recentOpportunities.map((opp) => (
                      <div key={opp.id} className="opportunity-item">
                        <div className="opp-icon">🎯</div>
                        <div className="opp-info">
                          <div className="opp-title">{opp.title}</div>
                          <div className="opp-meta">
                            <span className="opp-type">{opp.opportunity_type}</span>
                            <span className="opp-location">📍 {opp.location}</span>
                          </div>
                        </div>
                        <span className="opp-applications">
                          {opp.application_count || 0} apps
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="admin-card full-width">
            <div className="admin-card-header">
              <h3>Platform Activity</h3>
            </div>
            <div className="admin-card-body">
              <div className="activity-chart">
                <svg viewBox="0 0 800 200" className="chart-svg">
                  <defs>
                    <linearGradient id="admin-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <polyline
                    points="0,150 100,140 200,120 300,130 400,100 500,90 600,70 700,80 800,60"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                  />
                  <polyline
                    points="0,150 100,140 200,120 300,130 400,100 500,90 600,70 700,80 800,60 800,200 0,200"
                    fill="url(#admin-gradient)"
                  />
                </svg>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
