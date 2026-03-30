const pool = require('../config/database');

class Opportunity {
  static async createTable() {
    try {
      const createOpportunitiesTable = `
        CREATE TABLE IF NOT EXISTS opportunities (
          id SERIAL PRIMARY KEY,
          scout_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          opportunity_type VARCHAR(50) NOT NULL,
          position VARCHAR(100),
          location VARCHAR(255),
          age_range VARCHAR(50),
          experience_level VARCHAR(50),
          requirements TEXT,
          benefits TEXT,
          deadline DATE,
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      const createApplicationsTable = `
        CREATE TABLE IF NOT EXISTS applications (
          id SERIAL PRIMARY KEY,
          opportunity_id INTEGER REFERENCES opportunities(id) ON DELETE CASCADE,
          player_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          cover_letter TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          reviewed_at TIMESTAMP,
          UNIQUE(opportunity_id, player_id)
        )
      `;
      
      await pool.query(createOpportunitiesTable);
      await pool.query(createApplicationsTable);
      
      console.log('✅ Opportunities tables created successfully');
    } catch (error) {
      console.error('❌ Error creating opportunities tables:', error);
      throw error;
    }
  }

  static async create(opportunityData) {
    const {
      scout_id,
      title,
      description,
      opportunity_type,
      position,
      location,
      age_range,
      experience_level,
      requirements,
      benefits,
      deadline,
      contact_name,
      contact_email,
      contact_phone
    } = opportunityData;

    // Convert empty string deadline to null
    const deadlineValue = deadline && deadline.trim() !== '' ? deadline : null;

    const query = `
      INSERT INTO opportunities (
        scout_id, title, description, opportunity_type, position,
        location, age_range, experience_level, requirements, benefits, deadline,
        contact_name, contact_email, contact_phone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        scout_id, title, description, opportunity_type, position,
        location, age_range, experience_level, requirements, benefits, deadlineValue,
        contact_name, contact_email, contact_phone
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating opportunity:', error);
      throw error;
    }
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT o.*, u.name as scout_name, u.email as scout_email
      FROM opportunities o
      JOIN users u ON o.scout_id = u.id
      WHERE o.status = 'active'
        AND (o.deadline IS NULL OR o.deadline >= CURRENT_DATE)
    `;
    const params = [];

    if (filters.opportunity_type) {
      params.push(filters.opportunity_type);
      query += ` AND o.opportunity_type = $${params.length}`;
    }

    query += ' ORDER BY o.created_at DESC';

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching opportunities:', error);
      throw error;
    }
  }

  static async findById(id) {
    const query = `
      SELECT o.*, u.name as scout_name, u.email as scout_email,
        CASE 
          WHEN o.deadline IS NOT NULL AND o.deadline < CURRENT_DATE THEN true
          ELSE false
        END as is_expired
      FROM opportunities o
      JOIN users u ON o.scout_id = u.id
      WHERE o.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error fetching opportunity:', error);
      throw error;
    }
  }

  static async findByScoutId(scoutId) {
    const query = `
      SELECT o.*, 
        (SELECT COUNT(*) FROM applications WHERE opportunity_id = o.id) as application_count,
        CASE 
          WHEN o.deadline IS NOT NULL AND o.deadline < CURRENT_DATE THEN true
          ELSE false
        END as is_expired
      FROM opportunities o
      WHERE o.scout_id = $1
      ORDER BY o.created_at DESC
    `;

    try {
      const result = await pool.query(query, [scoutId]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching scout opportunities:', error);
      throw error;
    }
  }

  static async apply(opportunityId, playerId, coverLetter) {
    const query = `
      INSERT INTO applications (opportunity_id, player_id, cover_letter)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [opportunityId, playerId, coverLetter]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('You have already applied to this opportunity');
      }
      console.error('❌ Error applying to opportunity:', error);
      throw error;
    }
  }

  static async getApplicationsByPlayer(playerId) {
    const query = `
      SELECT a.*, o.title, o.opportunity_type, o.location, u.name as scout_name
      FROM applications a
      JOIN opportunities o ON a.opportunity_id = o.id
      JOIN users u ON o.scout_id = u.id
      WHERE a.player_id = $1
      ORDER BY a.applied_at DESC
    `;

    try {
      const result = await pool.query(query, [playerId]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching player applications:', error);
      throw error;
    }
  }

  static async getApplicationsByOpportunity(opportunityId) {
    const query = `
      SELECT a.*, u.name, u.email, p.full_name, p.profile_picture, p.position, p.age
      FROM applications a
      JOIN users u ON a.player_id = u.id
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE a.opportunity_id = $1
      ORDER BY a.applied_at DESC
    `;

    try {
      const result = await pool.query(query, [opportunityId]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching opportunity applications:', error);
      throw error;
    }
  }

  static async delete(opportunityId, scoutId) {
    // First verify the opportunity belongs to the scout
    const verifyQuery = 'SELECT id FROM opportunities WHERE id = $1 AND scout_id = $2';
    const verifyResult = await pool.query(verifyQuery, [opportunityId, scoutId]);
    
    if (verifyResult.rows.length === 0) {
      throw new Error('Opportunity not found or you do not have permission to delete it');
    }

    // Delete the opportunity (applications will be deleted automatically due to CASCADE)
    const deleteQuery = 'DELETE FROM opportunities WHERE id = $1 AND scout_id = $2 RETURNING *';
    
    try {
      const result = await pool.query(deleteQuery, [opportunityId, scoutId]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error deleting opportunity:', error);
      throw error;
    }
  }

  static async update(opportunityId, scoutId, opportunityData) {
    // First verify the opportunity belongs to the scout
    const verifyQuery = 'SELECT id FROM opportunities WHERE id = $1 AND scout_id = $2';
    const verifyResult = await pool.query(verifyQuery, [opportunityId, scoutId]);
    
    if (verifyResult.rows.length === 0) {
      throw new Error('Opportunity not found or you do not have permission to edit it');
    }

    const {
      title,
      description,
      opportunity_type,
      position,
      location,
      age_range,
      experience_level,
      requirements,
      benefits,
      deadline,
      contact_name,
      contact_email,
      contact_phone
    } = opportunityData;

    // Convert empty string deadline to null
    const deadlineValue = deadline && deadline.trim() !== '' ? deadline : null;

    const updateQuery = `
      UPDATE opportunities 
      SET title = $1, description = $2, opportunity_type = $3, position = $4,
          location = $5, age_range = $6, experience_level = $7, requirements = $8,
          benefits = $9, deadline = $10, contact_name = $11, contact_email = $12,
          contact_phone = $13, updated_at = CURRENT_TIMESTAMP
      WHERE id = $14 AND scout_id = $15
      RETURNING *
    `;

    try {
      const result = await pool.query(updateQuery, [
        title, description, opportunity_type, position, location, age_range,
        experience_level, requirements, benefits, deadlineValue, contact_name,
        contact_email, contact_phone, opportunityId, scoutId
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error updating opportunity:', error);
      throw error;
    }
  }
}

module.exports = Opportunity;
