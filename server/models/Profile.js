const pool = require('../config/database');

class Profile {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        full_name VARCHAR(255),
        date_of_birth DATE,
        gender VARCHAR(20),
        phone VARCHAR(20),
        location VARCHAR(255),
        district VARCHAR(100),
        province VARCHAR(100),
        bio TEXT,
        profile_picture TEXT,
        cover_photo TEXT,
        
        -- Sports Information (for players)
        primary_sport VARCHAR(50),
        secondary_sports TEXT[], -- Array of sports
        position VARCHAR(100),
        batting_style VARCHAR(50), -- Cricket: Right-handed, Left-handed
        bowling_style VARCHAR(100), -- Cricket: bowling type
        height DECIMAL(5,2), -- in cm
        weight DECIMAL(5,2), -- in kg
        preferred_foot VARCHAR(20), -- left, right, both
        
        -- Career Information
        current_team VARCHAR(255),
        previous_teams TEXT[],
        school_college VARCHAR(255),
        achievements TEXT[],
        
        -- Scout Information
        organization VARCHAR(255),
        certification VARCHAR(255),
        years_experience INTEGER,
        specialization TEXT[], -- sports they scout for
        
        -- Stats
        total_likes INTEGER DEFAULT 0,
        total_videos INTEGER DEFAULT 0,
        profile_views INTEGER DEFAULT 0,
        
        -- Badges
        badges TEXT[], -- Array of badge names
        verified BOOLEAN DEFAULT FALSE,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await pool.query(query);
      
      // Create indexes
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
        CREATE INDEX IF NOT EXISTS idx_profiles_primary_sport ON profiles(primary_sport);
        CREATE INDEX IF NOT EXISTS idx_profiles_district ON profiles(district);
        CREATE INDEX IF NOT EXISTS idx_profiles_total_likes ON profiles(total_likes DESC);
      `);
      
      console.log('✅ Profiles table created successfully');
    } catch (error) {
      console.error('❌ Error creating profiles table:', error);
      throw error;
    }
  }

  static async create(profileData) {
    const {
      user_id, full_name, date_of_birth, gender, phone, location,
      district, province, bio, primary_sport, secondary_sports, position, 
      batting_style, bowling_style, height, weight, preferred_foot, 
      current_team, previous_teams, school_college, achievements, 
      organization, certification, years_experience, specialization
    } = profileData;

    const query = `
      INSERT INTO profiles (
        user_id, full_name, date_of_birth, gender, phone, location,
        district, province, bio, primary_sport, secondary_sports, position, 
        batting_style, bowling_style, height, weight, preferred_foot, 
        current_team, previous_teams, school_college, achievements, 
        organization, certification, years_experience, specialization
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        user_id, full_name, date_of_birth, gender, phone, location,
        district, province, bio, primary_sport, secondary_sports, position, 
        batting_style, bowling_style, height, weight, preferred_foot, 
        current_team, previous_teams, school_college, achievements, 
        organization, certification, years_experience, specialization
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating profile:', error);
      throw error;
    }
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM profiles WHERE user_id = $1';
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(userId, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `
      UPDATE profiles 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [userId, ...values]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getLeaderboard(sport = null, limit = 50) {
    let query = `
      SELECT p.*, u.email, u.role
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE u.role = 'player'
    `;
    
    const params = [];
    if (sport) {
      query += ` AND p.primary_sport = $1`;
      params.push(sport);
    }
    
    query += ` ORDER BY p.profile_views DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async searchPlayers(filters = {}) {
    let query = `
      SELECT p.*, u.email, u.name
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE u.role = 'player'
    `;
    
    const params = [];
    let paramCount = 0;

    // Name search
    if (filters.search) {
      paramCount++;
      query += ` AND (p.full_name ILIKE $${paramCount} OR u.name ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
    }

    // Position filter - only apply if no batting/bowling style is specified
    if (filters.position && !filters.batting_style && !filters.bowling_style) {
      paramCount++;
      query += ` AND p.position = $${paramCount}`;
      params.push(filters.position);
    }

    // Batting style filter
    if (filters.batting_style) {
      paramCount++;
      query += ` AND p.batting_style = $${paramCount}`;
      params.push(filters.batting_style);
    }

    // Bowling style filter
    if (filters.bowling_style) {
      paramCount++;
      query += ` AND p.bowling_style = $${paramCount}`;
      params.push(filters.bowling_style);
    }

    // Location filter
    if (filters.location) {
      paramCount++;
      query += ` AND (p.location ILIKE $${paramCount} OR p.district ILIKE $${paramCount} OR p.province ILIKE $${paramCount})`;
      params.push(`%${filters.location}%`);
    }

    // Age range filter
    if (filters.min_age || filters.max_age) {
      if (filters.min_age) {
        query += ` AND p.date_of_birth <= CURRENT_DATE - INTERVAL '${parseInt(filters.min_age)} years'`;
      }
      if (filters.max_age) {
        query += ` AND p.date_of_birth >= CURRENT_DATE - INTERVAL '${parseInt(filters.max_age)} years'`;
      }
    }

    // Height range filter
    if (filters.min_height) {
      paramCount++;
      query += ` AND p.height >= $${paramCount}`;
      params.push(parseFloat(filters.min_height));
    }
    if (filters.max_height) {
      paramCount++;
      query += ` AND p.height <= $${paramCount}`;
      params.push(parseFloat(filters.max_height));
    }

    // Height filter - exact match
    if (filters.height) {
      paramCount++;
      query += ` AND p.height = $${paramCount}`;
      params.push(parseFloat(filters.height));
    }

    query += ` ORDER BY p.total_likes DESC LIMIT 100`;

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error searching players:', error);
      throw error;
    }
  }

  static async searchScouts(filters = {}) {
    let query = `
      SELECT 
        p.*, 
        u.id as user_id,
        u.email, 
        u.name, 
        u.role
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.role = 'scout'
    `;
    
    const params = [];
    let paramCount = 0;

    // Name search
    if (filters.search) {
      paramCount++;
      query += ` AND (p.full_name ILIKE $${paramCount} OR u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
    }

    // Organization filter
    if (filters.organization) {
      paramCount++;
      query += ` AND p.organization ILIKE $${paramCount}`;
      params.push(`%${filters.organization}%`);
    }

    // Location filter
    if (filters.location) {
      paramCount++;
      query += ` AND (p.location ILIKE $${paramCount} OR p.district ILIKE $${paramCount} OR p.province ILIKE $${paramCount})`;
      params.push(`%${filters.location}%`);
    }

    // Specialization filter (sports they scout for)
    if (filters.specialization) {
      paramCount++;
      query += ` AND $${paramCount} = ANY(p.specialization)`;
      params.push(filters.specialization);
    }

    // Years of experience filter
    if (filters.min_experience) {
      paramCount++;
      query += ` AND p.years_experience >= $${paramCount}`;
      params.push(parseInt(filters.min_experience));
    }

    query += ` ORDER BY COALESCE(p.profile_views, 0) DESC LIMIT 100`;

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error searching scouts:', error);
      throw error;
    }
  }

  static async incrementProfileView(userId) {
    const query = `
      UPDATE profiles 
      SET profile_views = COALESCE(profile_views, 0) + 1
      WHERE user_id = $1
      RETURNING profile_views
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error incrementing profile view:', error);
      throw error;
    }
  }
}

module.exports = Profile;
