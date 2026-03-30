const pool = require('../config/database');

class Conversation {
  static async createTable() {
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS conversations (
          id SERIAL PRIMARY KEY,
          scout_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          player_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          purpose VARCHAR(100) NOT NULL CHECK (purpose IN (
            'recruitment_inquiry',
            'trial_invitation',
            'performance_clarification',
            'contract_discussion',
            'response_to_scout'
          )),
          status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
            'pending',
            'active',
            'ignored_by_scout',
            'ignored_by_player',
            'blocked_by_scout',
            'blocked_by_player',
            'closed'
          )),
          initiated_by VARCHAR(10) NOT NULL CHECK (initiated_by IN ('scout', 'player')),
          closed_reason VARCHAR(100),
          closed_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(scout_id, player_id, purpose)
        )
      `;
      
      await pool.query(createTableQuery);
      
      // Create indexes
      await pool.query('CREATE INDEX IF NOT EXISTS idx_conversations_scout ON conversations(scout_id)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_conversations_player ON conversations(player_id)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status)');
      
      console.log('✅ Conversations table created successfully');
    } catch (error) {
      console.error('❌ Error creating conversations table:', error);
      throw error;
    }
  }

  static async create({ scoutId, playerId, purpose, initiatedBy }) {
    const query = `
      INSERT INTO conversations (scout_id, player_id, purpose, initiated_by, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const status = initiatedBy === 'scout' ? 'active' : 'pending';
    const result = await pool.query(query, [scoutId, playerId, purpose, initiatedBy, status]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT c.*, 
             s.name as scout_name, s.email as scout_email,
             p.name as player_name, p.email as player_email
      FROM conversations c
      JOIN users s ON c.scout_id = s.id
      JOIN users p ON c.player_id = p.id
      WHERE c.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByUserId(userId, userRole) {
    const query = userRole === 'scout' 
      ? `
        SELECT c.*, 
               u.name as other_user_name, u.email as other_user_email,
               prof.profile_picture as other_user_picture,
               (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = false AND sender_id != $1) as unread_count,
               (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
               (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
        FROM conversations c
        JOIN users u ON c.player_id = u.id
        LEFT JOIN profiles prof ON u.id = prof.user_id
        WHERE c.scout_id = $1
        ORDER BY c.updated_at DESC
      `
      : `
        SELECT c.*, 
               u.name as other_user_name, u.email as other_user_email,
               prof.profile_picture as other_user_picture,
               (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = false AND sender_id != $1) as unread_count,
               (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
               (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
        FROM conversations c
        JOIN users u ON c.scout_id = u.id
        LEFT JOIN profiles prof ON u.id = prof.user_id
        WHERE c.player_id = $1
        ORDER BY c.updated_at DESC
      `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async updateStatus(id, status, userId = null) {
    const query = userId
      ? 'UPDATE conversations SET status = $1, updated_at = CURRENT_TIMESTAMP, closed_by = $3 WHERE id = $2 RETURNING *'
      : 'UPDATE conversations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *';
    
    const params = userId ? [status, id, userId] : [status, id];
    const result = await pool.query(query, params);
    return result.rows[0];
  }

  static async closeConversation(id, reason, closedBy) {
    const query = `
      UPDATE conversations 
      SET status = 'closed', closed_reason = $1, closed_by = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [reason, closedBy, id]);
    return result.rows[0];
  }

  static async getPlayerRequestCount(playerId, month, year) {
    const query = `
      SELECT COUNT(*) 
      FROM conversations 
      WHERE player_id = $1 
        AND initiated_by = 'player'
        AND EXTRACT(MONTH FROM created_at) = $2
        AND EXTRACT(YEAR FROM created_at) = $3
    `;
    
    const result = await pool.query(query, [playerId, month, year]);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Conversation;
