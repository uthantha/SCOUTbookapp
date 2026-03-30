const express = require('express');
const router = express.Router();
const Opportunity = require('../models/Opportunity');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { authenticateToken } = require('../middleware/auth');

// Get all opportunities (public for players)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const opportunities = await Opportunity.findAll(req.query);
    res.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// Create opportunity (scouts only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'scout') {
      return res.status(403).json({ error: 'Only scouts can post opportunities' });
    }

    const opportunityData = {
      ...req.body,
      scout_id: req.user.id
    };

    const opportunity = await Opportunity.create(opportunityData);
    res.status(201).json(opportunity);
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ error: 'Failed to create opportunity' });
  }
});

// Get scout's opportunities
router.get('/scout/my-opportunities', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'scout') {
      return res.status(403).json({ error: 'Only scouts can access this' });
    }

    const opportunities = await Opportunity.findByScoutId(req.user.id);
    res.json(opportunities);
  } catch (error) {
    console.error('Error fetching scout opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// Get player's applications
router.get('/player/my-applications', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'player') {
      return res.status(403).json({ error: 'Only players can access this' });
    }

    const applications = await Opportunity.getApplicationsByPlayer(req.user.id);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get applications for an opportunity (scouts only)
router.get('/:id/applications', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'scout') {
      return res.status(403).json({ error: 'Only scouts can view applications' });
    }

    const applications = await Opportunity.getApplicationsByOpportunity(req.params.id);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Delete opportunity (scouts only) - MUST be before GET /:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'scout') {
      return res.status(403).json({ error: 'Only scouts can delete opportunities' });
    }

    console.log(`Delete request for opportunity ${req.params.id} by scout ${req.user.id}`);
    await Opportunity.delete(req.params.id, req.user.id);
    console.log(`Successfully deleted opportunity ${req.params.id}`);
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Error deleting opportunity:', error.message);
    if (error.message === 'Opportunity not found or you do not have permission to delete it') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete opportunity. Please try again.' });
  }
});

// Update opportunity (scouts only) - MUST be before GET /:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'scout') {
      return res.status(403).json({ error: 'Only scouts can update opportunities' });
    }

    const opportunity = await Opportunity.update(req.params.id, req.user.id, req.body);
    res.json(opportunity);
  } catch (error) {
    console.error('Error updating opportunity:', error.message);
    if (error.message === 'Opportunity not found or you do not have permission to edit it') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update opportunity. Please try again.' });
  }
});

// Get single opportunity - MUST be after more specific routes
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    res.json(opportunity);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
});

// Apply to opportunity (players only)
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'player') {
      return res.status(403).json({ error: 'Only players can apply to opportunities' });
    }

    const { coverLetter } = req.body;
    
    // Get opportunity details first
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Check if opportunity is expired
    if (opportunity.is_expired) {
      return res.status(400).json({ error: 'This opportunity has expired and is no longer accepting applications' });
    }

    // Apply to the opportunity
    const application = await Opportunity.apply(req.params.id, req.user.id, coverLetter);
    
    // Create or find existing conversation between scout and player
    let conversation;
    try {
      // Try to create a new conversation
      conversation = await Conversation.create({
        scoutId: opportunity.scout_id,
        playerId: req.user.id,
        purpose: 'recruitment_inquiry',
        initiatedBy: 'player'
      });
    } catch (error) {
      if (error.code === '23505') {
        // Conversation already exists, find it
        const existingConversations = await Conversation.findByUserId(req.user.id, 'player');
        conversation = existingConversations.find(conv => 
          conv.scout_id === opportunity.scout_id && 
          conv.purpose === 'recruitment_inquiry'
        );
      } else {
        throw error;
      }
    }

    if (conversation) {
      // Create application notification message
      const messageContent = coverLetter 
        ? `I have applied for your opportunity "${opportunity.title}". ${coverLetter}`
        : `I have applied for your opportunity "${opportunity.title}". I'm interested in this position and would like to discuss further.`;

      // Send message to scout
      await Message.create({
        conversationId: conversation.id,
        senderId: req.user.id,
        content: messageContent.substring(0, 500) // Ensure it fits the limit
      });

      // Activate conversation if it was pending
      if (conversation.status === 'pending') {
        await Conversation.updateStatus(conversation.id, 'active');
      }
    }

    res.status(201).json({
      ...application,
      conversationCreated: !!conversation,
      conversationId: conversation?.id
    });
  } catch (error) {
    if (error.message === 'You have already applied to this opportunity') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error applying to opportunity:', error);
    res.status(500).json({ error: 'Failed to apply to opportunity' });
  }
});

module.exports = router;
