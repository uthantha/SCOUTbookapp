const pool = require('../config/database');

class Tournament {
  static async createTable() {
    try {
      const createTournamentsTable = `
        CREATE TABLE IF NOT EXISTS tournaments (
          id SERIAL PRIMARY KEY,
          organizer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          organizer_role VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          tournament_format VARCHAR(50) NOT NULL,
          location VARCHAR(255) NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE,
          registration_deadline DATE,
          max_teams INTEGER,
          entry_fee VARCHAR(100),
          prize_details TEXT,
          rules TEXT,
          contact_info TEXT,
          status VARCHAR(50) DEFAULT 'upcoming',
          verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
          verified_by INTEGER REFERENCES users(id),
          verified_at TIMESTAMP,
          rejection_reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      const createRegistrationsTable = `
        CREATE TABLE IF NOT EXISTS tournament_registrations (
          id SERIAL PRIMARY KEY,
          tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
          team_name VARCHAR(255) NOT NULL,
          captain_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          contact_email VARCHAR(255) NOT NULL,
          contact_phone VARCHAR(50),
          team_size INTEGER,
          additional_info TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(tournament_id, team_name)
        )
      `;
      
      await pool.query(createTournamentsTable);
      await pool.query(createRegistrationsTable);
      
      console.log('✅ Tournaments tables created successfully');
    } catch (error) {
      console.error('❌ Error creating tournaments tables:', error);
      throw error;
    }
  }

  static async create(tournamentData) {
    const {
      organizer_id,
      organizer_role,
      title,
      description,
      tournament_format,
      location,
      start_date,
      end_date,
      registration_deadline,
      max_teams,
      entry_fee,
      prize_details,
      rules,
      contact_info
    } = tournamentData;

    // Convert empty strings to null for date fields
    const endDateValue = end_date && end_date.trim() !== '' ? end_date : null;
    const regDeadlineValue = registration_deadline && registration_deadline.trim() !== '' ? registration_deadline : null;

    const query = `
      INSERT INTO tournaments (
        organizer_id, organizer_role, title, description, tournament_format,
        location, start_date, end_date, registration_deadline, max_teams,
        entry_fee, prize_details, rules, contact_info
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        organizer_id, organizer_role, title, description, tournament_format,
        location, start_date, endDateValue, regDeadlineValue, max_teams,
        entry_fee, prize_details, rules, contact_info
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating tournament:', error);
      throw error;
    }
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT t.*, u.name as organizer_name, u.email as organizer_email,
        (SELECT COUNT(*) FROM tournament_registrations WHERE tournament_id = t.id) as registration_count
      FROM tournaments t
      JOIN users u ON t.organizer_id = u.id
      WHERE t.verification_status = 'approved'
    `;
    const params = [];

    if (filters.status) {
      params.push(filters.status);
      query += ` AND t.status = $${params.length}`;
    }

    query += ' ORDER BY t.start_date ASC';

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching tournaments:', error);
      throw error;
    }
  }

  static async findAllForAdmin() {
    const query = `
      SELECT t.*, u.name as organizer_name, u.email as organizer_email,
        (SELECT COUNT(*) FROM tournament_registrations WHERE tournament_id = t.id) as registration_count
      FROM tournaments t
      JOIN users u ON t.organizer_id = u.id
      ORDER BY 
        CASE t.verification_status
          WHEN 'pending' THEN 1
          WHEN 'approved' THEN 2
          WHEN 'rejected' THEN 3
        END,
        t.created_at DESC
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching tournaments for admin:', error);
      throw error;
    }
  }

  static async updateVerificationStatus(tournamentId, status, adminId, rejectionReason = null) {
    const query = `
      UPDATE tournaments
      SET verification_status = $1,
          verified_by = $2,
          verified_at = CURRENT_TIMESTAMP,
          rejection_reason = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [status, adminId, rejectionReason, tournamentId]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error updating verification status:', error);
      throw error;
    }
  }

  static async findById(id) {
    const query = `
      SELECT t.*, u.name as organizer_name, u.email as organizer_email,
        (SELECT COUNT(*) FROM tournament_registrations WHERE tournament_id = t.id) as registration_count
      FROM tournaments t
      JOIN users u ON t.organizer_id = u.id
      WHERE t.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error fetching tournament:', error);
      throw error;
    }
  }

  static async findByOrganizerId(organizerId) {
    const query = `
      SELECT t.*,
        (SELECT COUNT(*) FROM tournament_registrations WHERE tournament_id = t.id) as registration_count
      FROM tournaments t
      WHERE t.organizer_id = $1
      ORDER BY t.created_at DESC
    `;

    try {
      const result = await pool.query(query, [organizerId]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching organizer tournaments:', error);
      throw error;
    }
  }

  static async register(tournamentId, registrationData) {
    const {
      team_name,
      captain_id,
      contact_email,
      contact_phone,
      team_size,
      additional_info
    } = registrationData;

    const query = `
      INSERT INTO tournament_registrations (
        tournament_id, team_name, captain_id, contact_email,
        contact_phone, team_size, additional_info
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        tournamentId, team_name, captain_id, contact_email,
        contact_phone, team_size, additional_info
      ]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Team name already registered for this tournament');
      }
      console.error('❌ Error registering for tournament:', error);
      throw error;
    }
  }

  static async getRegistrationsByUser(userId) {
    const query = `
      SELECT r.*, t.title, t.tournament_format, t.location, t.start_date
      FROM tournament_registrations r
      JOIN tournaments t ON r.tournament_id = t.id
      WHERE r.captain_id = $1
      ORDER BY r.registered_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching user registrations:', error);
      throw error;
    }
  }

  static async getRegistrationsByTournament(tournamentId) {
    const query = `
      SELECT r.*, u.name as captain_name, u.email as captain_email
      FROM tournament_registrations r
      JOIN users u ON r.captain_id = u.id
      WHERE r.tournament_id = $1
      ORDER BY r.registered_at DESC
    `;

    try {
      const result = await pool.query(query, [tournamentId]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching tournament registrations:', error);
      throw error;
    }
  }
}

module.exports = Tournament;
