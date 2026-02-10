const { query } = require('../config/database');
const { hashPassword } = require('../utils/auth');

const createUser = async (userData) => {
    try {
        const { name, email, password, address, role = 'user' } = userData;
        
        // Hash password before saving to database
        const hashedPassword = await hashPassword(password);
        
        // Insert new user into database
        const queryText = `
            INSERT INTO users (name, email, password, address, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, email, address, role, created_at
        `;
        
        const result = await query(queryText, [name, email, hashedPassword, address, role]);
        
        console.log('New user created:', email);
        return result.rows[0];
        
    } catch (error) {
        if (error.code === '23505') {
            throw new Error('Email already exists');
        }
        throw new Error('Failed to create user');
    }
};

const findUserByEmail = async (email) => {
    try {
        const queryText = `
            SELECT id, name, email, password, address, role, created_at
            FROM users 
            WHERE email = $1
        `;
        
        const result = await query(queryText, [email]);
        return result.rows[0] || null;
        
    } catch (error) {
        throw new Error('Failed to find user');
    }
};


const findUserById = async (userId) => {
    try {
        const queryText = `
            SELECT id, name, email, address, role, created_at
            FROM users 
            WHERE id = $1
        `;
        
        const result = await query(queryText, [userId]);
        return result.rows[0] || null;
        
    } catch (error) {
        throw new Error('Failed to find user');
    }
};

const updateUserPassword = async (userId, newPassword) => {
    try {
        const hashedPassword = await hashPassword(newPassword);
        
        const queryText = `
            UPDATE users 
            SET password = $1 
            WHERE id = $2
        `;
        
        const result = await query(queryText, [hashedPassword, userId]);
        
        if (result.rowCount === 0) {
            throw new Error('User not found');
        }
        
        console.log('Password updated for user:', userId);
        return true;
        
    } catch (error) {
        throw new Error('Failed to update password');
    }
};


const userExistsByEmail = async (email) => {
    try {
        const queryText = `SELECT 1 FROM users WHERE email = $1`;
        const result = await query(queryText, [email]);
        
        return result.rows.length > 0;
        
    } catch (error) {
        throw new Error('Failed to check email');
    }
};


const getAllUsers = async () => {
    try {
        const queryText = `
            SELECT id, name, email, address, role, created_at
            FROM users 
            ORDER BY created_at DESC
        `;
        
        const result = await query(queryText);
        return result.rows;
        
    } catch (error) {
        throw new Error('Failed to get users');
    }
};


const getUserStats = async () => {
    try {
        const queryText = `
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins,
                COUNT(CASE WHEN role = 'user' THEN 1 END) as total_users_normal,
                COUNT(CASE WHEN role = 'store_owner' THEN 1 END) as total_store_owners
            FROM users
        `;
        
        const result = await query(queryText);
        const stats = result.rows[0];
        
        return {
            total_users: parseInt(stats.total_users),
            total_admins: parseInt(stats.total_admins),
            total_users_normal: parseInt(stats.total_users_normal),
            total_store_owners: parseInt(stats.total_store_owners)
        };
        
    } catch (error) {
        throw new Error('Failed to get user statistics');
    }
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserPassword,
    userExistsByEmail,
    getAllUsers,
    getUserStats
};