const pool = require('../config/database');

class Video {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url VARCHAR(500) NOT NULL,
        thumbnail_url VARCHAR(500),
        sport VARCHAR(50),
        category VARCHAR(50), -- highlight, training, match, skill
        duration INTEGER, -- in seconds
        likes_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await pool.query(query);
      
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
        CREATE INDEX IF NOT EXISTS idx_videos_sport ON videos(sport);
        CREATE INDEX IF NOT EXISTS idx_videos_likes ON videos(likes_count DESC);
        CREATE INDEX IF NOT EXISTS idx_videos_created ON videos(created_at DESC);
      `);
      
      // Likes table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS video_likes (
          id SERIAL PRIMARY KEY,
          video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(video_id, user_id)
        )
      `);
      
      console.log('✅ Videos tables created successfully');
    } catch (error) {
      console.error('❌ Error creating videos tables:', error);
      throw error;
    }
  }

  static async create(videoData) {
    const { user_id, title, description, video_url, thumbnail_url, sport, category, duration } = videoData;
    
    const query = `
      INSERT INTO videos (user_id, title, description, video_url, thumbnail_url, sport, category, duration)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        user_id, title, description, video_url, thumbnail_url, sport, category, duration
      ]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getFeed(limit = 20, offset = 0, sport = null) {
    let query = `
      SELECT v.*, u.email, p.full_name, p.profile_picture, p.primary_sport
      FROM videos v
      JOIN users u ON v.user_id = u.id
      LEFT JOIN profiles p ON v.user_id = p.user_id
      WHERE 1=1
    `;
    
    const params = [];
    if (sport) {
      params.push(sport);
      query += ` AND v.sport = $${params.length}`;
    }
    
    params.push(limit, offset);
    query += ` ORDER BY v.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async likeVideo(videoId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Add like
      await client.query(
        'INSERT INTO video_likes (video_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [videoId, userId]
      );
      
      // Update count
      await client.query(
        'UPDATE videos SET likes_count = likes_count + 1 WHERE id = $1',
        [videoId]
      );
      
      // Update profile total likes
      await client.query(`
        UPDATE profiles SET total_likes = total_likes + 1 
        WHERE user_id = (SELECT user_id FROM videos WHERE id = $1)
      `, [videoId]);
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Video;