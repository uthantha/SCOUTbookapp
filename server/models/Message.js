const pool = require('../config/database');

class Message {
  static async createTable() {
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
          sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL CHECK (LENGTH(content) <= 500),
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      await pool.query(createTableQuery);
      
      // Create indexes
      await pool.query('CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC)');
      
      console.log('✅ Messages table created successfully');
    } catch (error) {
      console.error('❌ Error creating messages table:', error);
      throw error;
    }
  }

  static async create({ conversationId, senderId, content }) {
    // Validate message length
    if (content.length > 500) {
      throw new Error('Message exceeds maximum length of 500 characters');
    }

    const query = `
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [conversationId, senderId, content]);
    
    // Update conversation timestamp
    await pool.query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [conversationId]
    );
    
    return result.rows[0];
  }

  static async findByConversationId(conversationId) {
    const query = `
      SELECT m.*, u.name as sender_name, u.email as sender_email
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `;
    
    const result = await pool.query(query, [conversationId]);
    return result.rows;
  }

  static async markAsRead(conversationId, userId) {
    const query = `
      UPDATE messages 
      SET is_read = true 
      WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false
    `;
    
    await pool.query(query, [conversationId, userId]);
  }

  static async getLastMessageTime(senderId, conversationId) {
    const query = `
      SELECT created_at 
      FROM messages 
      WHERE sender_id = $1 AND conversation_id = $2
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = await pool.query(query, [senderId, conversationId]);
    return result.rows[0]?.created_at;
  }

  static async getUnreadCount(userId) {
    const query = `
      SELECT COUNT(*) 
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.sender_id != $1 
        AND m.is_read = false
        AND (c.scout_id = $1 OR c.player_id = $1)
    `;
    
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  static async checkSpamPattern(senderId, conversationId, timeWindowMinutes = 5) {
    const query = `
      SELECT COUNT(*) 
      FROM messages 
      WHERE sender_id = $1 
        AND conversation_id = $2
        AND created_at > NOW() - INTERVAL '${timeWindowMinutes} minutes'
    `;
    
    const result = await pool.query(query, [senderId, conversationId]);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Message;
