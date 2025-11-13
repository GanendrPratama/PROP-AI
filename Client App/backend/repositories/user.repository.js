const db = require('../database/pg.database');
const bcrypt = require('bcrypt');

class UserRepository {
    /**
     * Get all users
     */
    async getAllUsers() {
        const result = await db.query(
            'SELECT user_id, full_name, email, phone_number, created_at FROM "Users" ORDER BY created_at DESC'
        );
        return result.rows;
    }

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        const result = await db.query(
            'SELECT user_id, full_name, email, phone_number, created_at FROM "Users" WHERE user_id = $1',
            [userId]
        );
        return result.rows[0];
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email) {
        const result = await db.query(
            'SELECT * FROM "Users" WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }

    /**
     * Create new user
     */
    async createUser(userData) {
        const { full_name, email, password, phone_number } = userData;
        
        // Hash password
        const password_hash = await bcrypt.hash(password, 10);
        
        const result = await db.query(
            'INSERT INTO "Users" (full_name, email, password_hash, phone_number) VALUES ($1, $2, $3, $4) RETURNING user_id, full_name, email, phone_number, created_at',
            [full_name, email, password_hash, phone_number]
        );
        return result.rows[0];
    }

    /**
     * Update user
     */
    async updateUser(userId, userData) {
        const { full_name, phone_number } = userData;
        
        const result = await db.query(
            'UPDATE "Users" SET full_name = $1, phone_number = $2 WHERE user_id = $3 RETURNING user_id, full_name, email, phone_number, created_at',
            [full_name, phone_number, userId]
        );
        return result.rows[0];
    }

    /**
     * Delete user
     */
    async deleteUser(userId) {
        const result = await db.query(
            'DELETE FROM "Users" WHERE user_id = $1 RETURNING user_id',
            [userId]
        );
        return result.rows[0];
    }

    /**
     * Verify user password
     */
    async verifyPassword(email, password) {
        const user = await this.getUserByEmail(email);
        if (!user) return null;
        
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return null;
        
        // Return user without password hash
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

module.exports = new UserRepository();
