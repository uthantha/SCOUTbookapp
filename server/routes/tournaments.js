const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get all approved tournaments (public for authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tournaments = await Tournament.findAll(req.query);
    res.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Get all tournaments for admin (includes pending/rejected)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tournaments = await Tournament.findAllForAdmin();
    res.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments for admin:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Admin: Approve tournament
router.post('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tournament = await Tournament.updateVerificationStatus(
      req.params.id,
      'approved',
      req.user.id
    );
    res.json({ message: 'Tournament approved successfully', tournament });
  } catch (error) {
    console.error('Error approving tournament:', error);
    res.status(500).json({ error: 'Failed to approve tournament' });
  }
});

// Admin: Reject tournament
router.post('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const tournament = await Tournament.updateVerificationStatus(
      req.params.id,
      'rejected',
      req.user.id,
      reason
    );
    res.json({ message: 'Tournament rejected', tournament });
  } catch (error) {
    console.error('Error rejecting tournament:', error);
    res.status(500).json({ error: 'Failed to reject tournament' });
  }
});

// Get single tournament
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.json(tournament);
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
});

// Create tournament (both scouts and players can create)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const tournamentData = {
      ...req.body,
      organizer_id: req.user.id,
      organizer_role: req.user.role
    };

    const tournament = await Tournament.create(tournamentData);
    res.status(201).json(tournament);
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

// Get user's tournaments
router.get('/user/my-tournaments', authenticateToken, async (req, res) => {
  try {
    const tournaments = await Tournament.findByOrganizerId(req.user.id);
    res.json(tournaments);
  } catch (error) {
    console.error('Error fetching user tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Register for tournament
router.post('/:id/register', authenticateToken, async (req, res) => {
  try {
    const registrationData = {
      ...req.body,
      captain_id: req.user.id
    };

    const registration = await Tournament.register(req.params.id, registrationData);
    res.status(201).json(registration);
  } catch (error) {
    if (error.message === 'Team name already registered for this tournament') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error registering for tournament:', error);
    res.status(500).json({ error: 'Failed to register for tournament' });
  }
});

// Get user's registrations
router.get('/user/my-registrations', authenticateToken, async (req, res) => {
  try {
    const registrations = await Tournament.getRegistrationsByUser(req.user.id);
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Get registrations for a tournament
router.get('/:id/registrations', authenticateToken, async (req, res) => {
  try {
    const registrations = await Tournament.getRegistrationsByTournament(req.params.id);
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

module.exports = router;
