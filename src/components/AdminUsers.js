import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/admin-users.css';

export default function AdminUsers({ user }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/admin/users?role=${filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        }
      });
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        }
      });
      loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-with-sidebar">
      <Sidebar user={user} />
      
      <div className="dashboard-main-content">
        <div className="admin-users-container">
          <div className="admin-page-header">
            <div>
              <h1>User Management</h1>
              <p>Manage all users on the platform</p>
            </div>
          </div>

          {/* Filters */}
          <div className="admin-filters">
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Users
              </button>
              <button
                className={`filter-btn ${filter === 'player' ? 'active' : ''}`}
                onClick={() => setFilter('player')}
              >
                Players
              </button>
              <button
                className={`filter-btn ${filter === 'scout' ? 'active' : ''}`}
                onClick={() => setFilter('scout')}
              >
                Scouts
              </button>
              <button
                className={`filter-btn ${filter === 'admin' ? 'active' : ''}`}
                onClick={() => setFilter('admin')}
              >
                Admins
              </button>
            </div>

            <div className="search-box">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          {/* Users Table */}
          <div className="admin-table-card">
            {loading ? (
              <div className="loading-state">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="empty-state">No users found</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-small">
                            {u.profile_picture ? (
                              <img src={u.profile_picture} alt={u.name} />
                            ) : (
                              <div className="avatar-placeholder-small">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="user-name-cell">{u.name}</span>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className="status-badge active">Active</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action view"
                            onClick={() => navigate(`/profile/${u.id}`)}
                            title="View Profile"
                          >
                            👁️
                          </button>
                          <button
                            className="btn-action delete"
                            onClick={() => handleDeleteUser(u.id)}
                            title="Delete User"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
