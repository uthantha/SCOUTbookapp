const pool = require('../config/database');

class PasswordReset {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await pool.query(query);
      
      // Create index for faster lookups
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
        CREATE INDEX IF NOT EXISTS idx_password_resets_code ON password_resets(code);
      `);
      
      console.log('✅ Password resets table created/verified successfully');
    } catch (error) {
      console.error('❌ Error creating password_resets table:', error);
      throw error;
    }
  }

  static async createResetCode(email, code, expiresInMinutes = 10) {
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    
    const query = `
      INSERT INTO password_resets (email, code, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, email, code, expires_at
    `;
    
    try {
      const result = await pool.query(query, [email, code, expiresAt]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating reset code:', error);
      throw error;
    }
  }

  static async verifyCode(email, code) {
    const query = `
      SELECT * FROM password_resets 
      WHERE email = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    try {
      const result = await pool.query(query, [email, code]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error verifying code:', error);
      throw error;
    }
  }

  static async markAsUsed(id) {
    const query = `
      UPDATE password_resets 
      SET used = TRUE 
      WHERE id = $1
    `;
    
    try {
      await pool.query(query, [id]);
    } catch (error) {
      console.error('❌ Error marking code as used:', error);
      throw error;
    }
  }

  static async deleteExpiredCodes() {
    const query = `
      DELETE FROM password_resets 
      WHERE expires_at < NOW() OR used = TRUE
    `;
    
    try {
      const result = await pool.query(query);
      return result.rowCount;
    } catch (error) {
      console.error('❌ Error deleting expired codes:', error);
      throw error;
    }
  }

  static generateCode() {
    // Generate 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

module.exports = PasswordReset;