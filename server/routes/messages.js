const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// All routes require authentication
router.use(authenticateToken);

// Configuration
const MAX_PLAYER_REQUESTS_PER_MONTH = 3;
const MESSAGE_COOLDOWN_SECONDS = 60;

// Get all conversations for current user
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Conversation.findByUserId(req.user.id, req.user.role);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get single conversation with messages
router.get('/conversations/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check if user is participant
    if (conversation.scout_id !== req.user.id && conversation.player_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get messages
    const messages = await Message.findByConversationId(req.params.id);
    
    // Mark messages as read
    await Message.markAsRead(req.params.id, req.user.id);
    
    res.json({ conversation, messages });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Create new conversation
router.post('/conversations', async (req, res) => {
  try {
    const { recipientId, purpose } = req.body;
    
    if (!recipientId || !purpose) {
      return res.status(400).json({ error: 'Recipient and purpose are required' });
    }
    
    // Validate purpose
    const validPurposes = [
      'recruitment_inquiry',
      'trial_invitation',
      'performance_clarification',
      'contract_discussion',
      'response_to_scout'
    ];
    
    if (!validPurposes.includes(purpose)) {
      return res.status(400).json({ error: 'Invalid purpose' });
    }
    
    // Determine roles
    let scoutId, playerId, initiatedBy;
    
    if (req.user.role === 'scout') {
      scoutId = req.user.id;
      playerId = recipientId;
      initiatedBy = 'scout';
    } else if (req.user.role === 'player') {
      // Check if player has exceeded monthly limit
      const now = new Date();
      const requestCount = await Conversation.getPlayerRequestCount(
        req.user.id,
        now.getMonth() + 1,
        now.getFullYear()
      );
      
      if (requestCount >= MAX_PLAYER_REQUESTS_PER_MONTH) {
        return res.status(429).json({ 
          error: `You have reached the maximum of ${MAX_PLAYER_REQUESTS_PER_MONTH} conversation requests per month` 
        });
      }
      
      scoutId = recipientId;
      playerId = req.user.id;
      initiatedBy = 'player';
    } else {
      return res.status(403).json({ error: 'Only scouts and players can create conversations' });
    }
    
    // Create conversation
    const conversation = await Conversation.create({
      scoutId,
      playerId,
      purpose,
      initiatedBy
    });
    
    res.status(201).json(conversation);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Conversation with this purpose already exists' });
    }
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Send message
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    if (content.length > 500) {
      return res.status(400).json({ error: 'Message exceeds maximum length of 500 characters' });
    }
    
    // Get conversation
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check if user is participant
    if (conversation.scout_id !== req.user.id && conversation.player_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check conversation status
    if (conversation.status === 'closed') {
      return res.status(403).json({ error: 'Cannot send messages to closed conversation' });
    }
    
    if (conversation.status.includes('blocked')) {
      return res.status(403).json({ error: 'Cannot send messages to blocked conversation' });
    }
    
    if (conversation.status === 'pending' && req.user.id === conversation.scout_id) {
      return res.status(403).json({ error: 'Cannot send messages until player request is approved' });
    }
    
    // Check cooldown
    const lastMessageTime = await Message.getLastMessageTime(req.user.id, req.params.id);
    if (lastMessageTime) {
      const timeSinceLastMessage = (Date.now() - new Date(lastMessageTime).getTime()) / 1000;
      if (timeSinceLastMessage < MESSAGE_COOLDOWN_SECONDS) {
        const remainingTime = Math.ceil(MESSAGE_COOLDOWN_SECONDS - timeSinceLastMessage);
        return res.status(429).json({ 
          error: `Please wait ${remainingTime} seconds before sending another message` 
        });
      }
    }
    
    // Check for spam pattern
    const recentMessageCount = await Message.checkSpamPattern(req.user.id, req.params.id, 5);
    if (recentMessageCount >= 5) {
      return res.status(429).json({ error: 'Too many messages sent recently. Please slow down.' });
    }
    
    // Create message
    const message = await Message.create({
      conversationId: req.params.id,
      senderId: req.user.id,
      content: content.trim()
    });
    
    // If conversation is pending and player is sending first message, activate it
    if (conversation.status === 'pending' && req.user.id === conversation.player_id) {
      await Conversation.updateStatus(req.params.id, 'active');
    }
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Approve player request (scout only)
router.post('/conversations/:id/approve', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    if (conversation.scout_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the scout can approve this request' });
    }
    
    if (conversation.status !== 'pending') {
      return res.status(400).json({ error: 'Conversation is not pending approval' });
    }
    
    const updated = await Conversation.updateStatus(req.params.id, 'active');
    res.json(updated);
  } catch (error) {
    console.error('Error approving conversation:', error);
    res.status(500).json({ error: 'Failed to approve conversation' });
  }
});

// Ignore conversation
router.post('/conversations/:id/ignore', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    if (conversation.scout_id !== req.user.id && conversation.player_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const status = req.user.id === conversation.scout_id 
      ? 'ignored_by_scout' 
      : 'ignored_by_player';
    
    const updated = await Conversation.updateStatus(req.params.id, status);
    res.json(updated);
  } catch (error) {
    console.error('Error ignoring conversation:', error);
    res.status(500).json({ error: 'Failed to ignore conversation' });
  }
});

// Unignore conversation
router.post('/conversations/:id/unignore', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    if (conversation.scout_id !== req.user.id && conversation.player_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updated = await Conversation.updateStatus(req.params.id, 'active');
    res.json(updated);
  } catch (error) {
    console.error('Error unignoring conversation:', error);
    res.status(500).json({ error: 'Failed to unignore conversation' });
  }
});

// Block conversation
router.post('/conversations/:id/block', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    if (conversation.scout_id !== req.user.id && conversation.player_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const status = req.user.id === conversation.scout_id 
      ? 'blocked_by_scout' 
      : 'blocked_by_player';
    
    const updated = await Conversation.updateStatus(req.params.id, status);
    res.json(updated);
  } catch (error) {
    console.error('Error blocking conversation:', error);
    res.status(500).json({ error: 'Failed to block conversation' });
  }
});

// Close conversation
router.post('/conversations/:id/close', async (req, res) => {
  try {
    const { reason } = req.body;
    
    const validReasons = [
      'recruitment_completed',
      'not_a_fit',
      'no_response',
      'other'
    ];
    
    if (!reason || !validReasons.includes(reason)) {
      return res.status(400).json({ error: 'Valid reason is required' });
    }
    
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    if (conversation.scout_id !== req.user.id && conversation.player_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updated = await Conversation.closeConversation(req.params.id, reason, req.user.id);
    res.json(updated);
  } catch (error) {
    console.error('Error closing conversation:', error);
    res.status(500).json({ error: 'Failed to close conversation' });
  }
});

// Get unread message count
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Message.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

module.exports = router;
