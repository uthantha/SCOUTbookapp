const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const { authenticateToken } = require('../middleware/auth');

// Get current user's profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const profile = await Profile.findByUserId(req.user.id);
    res.json(profile || {});
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Search players (for scouts) - MUST come before /:userId route
router.get('/search/players', authenticateToken, async (req, res) => {
  try {
    const filters = req.query;
    const players = await Profile.searchPlayers(filters);
    res.json(players);
  } catch (error) {
    console.error('Error searching players:', error);
    res.status(500).json({ error: 'Failed to search players' });
  }
});

// Search scouts (for players) - MUST come before /:userId route
router.get('/search/scouts', authenticateToken, async (req, res) => {
  try {
    const filters = req.query;
    const scouts = await Profile.searchScouts(filters);
    res.json(scouts);
  } catch (error) {
    console.error('Error searching scouts:', error);
    res.status(500).json({ error: 'Failed to search scouts' });
  }
});

// Get leaderboard - MUST come before /:userId route
router.get('/leaderboard', async (req, res) => {
  try {
    const sport = req.query.sport || null;
    const limit = parseInt(req.query.limit) || 50;
    const leaderboard = await Profile.getLeaderboard(sport, limit);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Create or update profile
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    // Remove system fields that shouldn't be updated directly
    const { id, user_id, created_at, updated_at, total_likes, total_videos, profile_views, badges, verified, ...cleanedData } = profileData;

    // Clean up empty strings for numeric fields
    ['height', 'weight', 'years_experience'].forEach(field => {
      if (cleanedData[field] === '' || cleanedData[field] === null) {
        cleanedData[field] = null;
      }
    });

    // Convert empty arrays to null for PostgreSQL
    ['secondary_sports', 'previous_teams', 'achievements', 'specialization'].forEach(field => {
      if (Array.isArray(cleanedData[field]) && cleanedData[field].length === 0) {
        cleanedData[field] = null;
      }
    });

    // Check if profile exists
    const existingProfile = await Profile.findByUserId(userId);

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await Profile.update(userId, cleanedData);
    } else {
      // Create new profile
      profile = await Profile.create({ ...cleanedData, user_id: userId });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get profile by user ID (public) - MUST come after /search/players
router.get('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findByUserId(req.params.userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Increment profile view count
router.post('/:userId/view', authenticateToken, async (req, res) => {
  try {
    const viewedUserId = parseInt(req.params.userId);
    const viewerUserId = req.user.id;

    // Don't increment if viewing own profile
    if (viewedUserId === viewerUserId) {
      return res.json({ message: 'Own profile view not counted' });
    }

    const result = await Profile.incrementProfileView(viewedUserId);
    res.json(result);
  } catch (error) {
    console.error('Error incrementing profile view:', error);
    res.status(500).json({ error: 'Failed to increment profile view' });
  }
});

module.exports = router;
