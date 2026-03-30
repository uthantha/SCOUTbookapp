import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/messages.css';

export default function Messages({ user }) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        }
      });
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPurposeLabel = (purpose) => {
    const labels = {
      'recruitment_inquiry': 'Recruitment Inquiry',
      'trial_invitation': 'Trial Invitation',
      'performance_clarification': 'Performance Clarification',
      'contract_discussion': 'Contract Discussion',
      'response_to_scout': 'Response to Scout'
    };
    return labels[purpose] || purpose;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending': { label: 'Pending Approval', class: 'warning' },
      'active': { label: 'Active', class: 'success' },
      'ignored_by_scout': { label: 'Ignored', class: 'muted' },
      'ignored_by_player': { label: 'Ignored', class: 'muted' },
      'blocked_by_scout': { label: 'Blocked', class: 'danger' },
      'blocked_by_player': { label: 'Blocked', class: 'danger' },
      'closed': { label: 'Closed', class: 'secondary' }
    };
    return badges[status] || { label: status, class: 'secondary' };
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'all') return true;
    if (filter === 'active') return conv.status === 'active';
    if (filter === 'pending') return conv.status === 'pending';
    if (filter === 'closed') return conv.status === 'closed';
    return true;
  });

  return (
    <div className="messages-wrapper">
      <div className="messages-container">
        <div className="messages-header">
          <div>
            <h1>Messages</h1>
            <p>Recruitment-focused conversations</p>
          </div>
          <button className="btn-new-message" onClick={() => navigate('/messages/new')}>
            + New Conversation
          </button>
        </div>

          {/* Filters */}
          <div className="messages-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-btn ${filter === 'closed' ? 'active' : ''}`}
              onClick={() => setFilter('closed')}
            >
              Closed
            </button>
          </div>

          {/* Conversations List */}
          <div className="conversations-list">
            {loading ? (
              <div className="loading-state">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <span className="material-icons">message</span>
                </div>
                <h3>No conversations yet</h3>
                <p>Start a conversation to connect with {user.role === 'scout' ? 'players' : 'scouts'}</p>
                <button className="btn-primary" onClick={() => navigate('/messages/new')}>
                  Start Conversation
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const statusBadge = getStatusBadge(conv.status);
                return (
                  <div
                    key={conv.id}
                    className="conversation-card"
                    onClick={() => navigate(`/messages/${conv.id}`)}
                  >
                    <div className="conv-avatar">
                      {conv.other_user_picture ? (
                        <img src={conv.other_user_picture} alt={conv.other_user_name} />
                      ) : (
                        <div className="avatar-placeholder">
                          {conv.other_user_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className="conv-content">
                      <div className="conv-header">
                        <h3>{conv.other_user_name}</h3>
                        <span className={`status-badge ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                      
                      <div className="conv-purpose">
                        <span className="material-icons">work</span> {getPurposeLabel(conv.purpose)}
                      </div>
                      
                      {conv.last_message && (
                        <div className="conv-last-message">
                          {conv.last_message}
                        </div>
                      )}
                      
                      <div className="conv-meta">
                        {conv.last_message_time && (
                          <span className="conv-time">
                            {new Date(conv.last_message_time).toLocaleDateString()}
                          </span>
                        )}
                        {conv.unread_count > 0 && (
                          <span className="unread-badge">{conv.unread_count}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
    </div>
  );
}
