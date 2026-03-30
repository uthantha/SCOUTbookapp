const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Middleware to check if user is admin
router.use(authenticateToken);
router.use(requireAdmin);

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    // Get total users
    const totalUsersResult = await pool.query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count);

    // Get users by role
    const playersResult = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['player']);
    const scoutsResult = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['scout']);
    const totalPlayers = parseInt(playersResult.rows[0].count);
    const totalScouts = parseInt(scoutsResult.rows[0].count);

    // Get total opportunities
    const opportunitiesResult = await pool.query('SELECT COUNT(*) FROM opportunities');
    const totalOpportunities = parseInt(opportunitiesResult.rows[0].count);

    // Get total applications
    const applicationsResult = await pool.query('SELECT COUNT(*) FROM applications');
    const totalApplications = parseInt(applicationsResult.rows[0].count);

    // Get total tournaments
    const tournamentsResult = await pool.query('SELECT COUNT(*) FROM tournaments');
    const totalTournaments = parseInt(tournamentsResult.rows[0].count);

    // Get active users (logged in within last 30 days)
    const activeUsersResult = await pool.query(
      'SELECT COUNT(*) FROM users WHERE last_login > NOW() - INTERVAL \'30 days\''
    );
    const activeUsers = parseInt(activeUsersResult.rows[0].count);

    // Get new users this month
    const newUsersResult = await pool.query(
      'SELECT COUNT(*) FROM users WHERE created_at > DATE_TRUNC(\'month\', CURRENT_DATE)'
    );
    const newUsersThisMonth = parseInt(newUsersResult.rows[0].count);

    // Get recent users
    const recentUsersResult = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.created_at, p.profile_picture
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      ORDER BY u.created_at DESC
      LIMIT 5
    `);

    // Get recent opportunities
    const recentOpportunitiesResult = await pool.query(`
      SELECT o.id, o.title, o.opportunity_type, o.location, o.created_at,
             COUNT(a.id) as application_count
      FROM opportunities o
      LEFT JOIN applications a ON o.id = a.opportunity_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    res.json({
      stats: {
        totalUsers,
        totalPlayers,
        totalScouts,
        totalOpportunities,
        totalApplications,
        totalTournaments,
        activeUsers,
        newUsersThisMonth
      },
      recentUsers: recentUsersResult.rows,
      recentOpportunities: recentOpportunitiesResult.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get all users with optional role filter
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.created_at, u.last_login, p.profile_picture
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
    `;
    
    const params = [];
    if (role && role !== 'all') {
      query += ' WHERE u.role = $1';
      params.push(role);
    }
    
    query += ' ORDER BY u.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const userId = req.params.id;
    
    // Don't allow deleting yourself
    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    // Delete related data first
    await client.query('DELETE FROM applications WHERE player_id = $1', [userId]);
    await client.query('DELETE FROM opportunities WHERE scout_id = $1', [userId]);
    await client.query('DELETE FROM tournament_registrations WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM tournaments WHERE organizer_id = $1', [userId]);
    await client.query('DELETE FROM videos WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM profiles WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM password_resets WHERE user_id = $1', [userId]);
    
    // Delete user
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
    
    await client.query('COMMIT');
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  } finally {
    client.release();
  }
});

// Get all opportunities
router.get('/opportunities', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.name as scout_name, COUNT(a.id) as application_count
      FROM opportunities o
      JOIN users u ON o.scout_id = u.id
      LEFT JOIN applications a ON o.id = a.opportunity_id
      GROUP BY o.id, u.name
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// Delete opportunity
router.delete('/opportunities/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const opportunityId = req.params.id;
    
    // Delete applications first
    await client.query('DELETE FROM applications WHERE opportunity_id = $1', [opportunityId]);
    
    // Delete opportunity
    await client.query('DELETE FROM opportunities WHERE id = $1', [opportunityId]);
    
    await client.query('COMMIT');
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ error: 'Failed to delete opportunity' });
  } finally {
    client.release();
  }
});

// Get all tournaments
router.get('/tournaments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.name as organizer_name, COUNT(tr.id) as registration_count
      FROM tournaments t
      JOIN users u ON t.organizer_id = u.id
      LEFT JOIN tournament_registrations tr ON t.id = tr.tournament_id
      GROUP BY t.id, u.name
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Delete tournament
router.delete('/tournaments/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const tournamentId = req.params.id;
    
    // Delete registrations first
    await client.query('DELETE FROM tournament_registrations WHERE tournament_id = $1', [tournamentId]);
    
    // Delete tournament
    await client.query('DELETE FROM tournaments WHERE id = $1', [tournamentId]);
    
    await client.query('COMMIT');
    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting tournament:', error);
    res.status(500).json({ error: 'Failed to delete tournament' });
  } finally {
    client.release();
  }
});

module.exports = router;
