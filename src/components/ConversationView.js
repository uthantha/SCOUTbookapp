import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/conversation.css';

export default function ConversationView({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConversation();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/messages/conversations/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load conversation');
      }
      
      const data = await response.json();
      setConversation(data.conversation);
      setMessages(data.messages);
    } catch (err) {
      setError('Failed to load conversation');
      console.error('Error loading conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    try {
      setSending(true);
      const response = await fetch(`http://localhost:5000/api/messages/conversations/${id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newMessage.trim() })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      const message = await response.json();
      setMessages(prev => [...prev, {
        ...message,
        sender_name: user.name,
        sender_email: user.email
      }]);
      setNewMessage('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="dashboard-with-sidebar">
        <Sidebar user={user} />
        <div className="dashboard-main-content">
          <div className="loading-state">Loading conversation...</div>
        </div>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="dashboard-with-sidebar">
        <Sidebar user={user} />
        <div className="dashboard-main-content">
          <div className="error-state">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => navigate('/messages')}>Back to Messages</button>
          </div>
        </div>
      </div>
    );
  }

  const canSendMessages = conversation && 
    conversation.status === 'active' && 
    !conversation.status.includes('blocked') && 
    conversation.status !== 'closed';

  return (
    <div className="dashboard-with-sidebar">
      <Sidebar user={user} />
      
      <div className="dashboard-main-content">
        <div className="conversation-container">
          {/* Header */}
          <div className="conversation-header">
            
            <div className="conversation-info">
              <h2>{user.role === 'scout' ? conversation.player_name : conversation.scout_name}</h2>
              <div className="conversation-purpose">
                🎯 {getPurposeLabel(conversation.purpose)}
              </div>
              <div className="conversation-status">
                Status: {conversation.status.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-container">
            <div className="messages-list">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.sender_id === user.userId ? 'own' : 'other'}`}
                  >
                    <div className="message-content">
                      <div className="message-text">{message.content}</div>
                      <div className="message-time">
                        {formatTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          {canSendMessages ? (
            <form onSubmit={sendMessage} className="message-input-form">
              {error && <div className="error-message">{error}</div>}
              <div className="message-input-container">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message... (max 500 characters)"
                  maxLength={500}
                  rows={3}
                  disabled={sending}
                />
                <div className="input-actions">
                  <span className="char-count">
                    {newMessage.length}/500
                  </span>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="btn-send"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="conversation-disabled">
              <p>
                {conversation.status === 'closed' && 'This conversation has been closed.'}
                {conversation.status.includes('blocked') && 'This conversation has been blocked.'}
                {conversation.status === 'pending' && 'This conversation is pending approval.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}