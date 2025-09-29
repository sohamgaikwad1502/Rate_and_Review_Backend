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


const getUserStats = async () => {
    try {
        const sql = `
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins,
                COUNT(CASE WHEN role = 'user' THEN 1 END) as total_users_normal,
                COUNT(CASE WHEN role = 'store_owner' THEN 1 END) as total_store_owners,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as users_this_month
            FROM users
        `;
        
        const result = await query(sql);
        const stats = result.rows[0];
        
        return {
            total_users: parseInt(stats.total_users),
            total_admins: parseInt(stats.total_admins),
            total_users_normal: parseInt(stats.total_users_normal),
            total_store_owners: parseInt(stats.total_store_owners),
            users_this_month: parseInt(stats.users_this_month)
        };
        
    } catch (error) {
        throw new Error('Failed to get user statistics');
    }
};

// ==========================================
// GET ALL USERS WITH FILTERS AND SORTING (For Admin)
// ==========================================
const getAllUsersWithFilters = async (filters = {}, sorting = {}) => {
    try {
        let queryText = `
            SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
                   CASE 
                       WHEN u.role = 'store_owner' THEN (
                           SELECT AVG(r.rating) 
                           FROM ratings r 
                           JOIN stores s ON r.store_id = s.id 
                           WHERE s.owner_id = u.id
                       )
                       ELSE NULL 
                   END as average_rating
            FROM users u
            WHERE 1=1
        `;
        
        const queryParams = [];
        let paramCount = 0;
        
        // Add filters
        if (filters.name) {
            paramCount++;
            queryText += ` AND LOWER(u.name) LIKE LOWER($${paramCount})`;
            queryParams.push(`%${filters.name}%`);
        }
        
        if (filters.email) {
            paramCount++;
            queryText += ` AND LOWER(u.email) LIKE LOWER($${paramCount})`;
            queryParams.push(`%${filters.email}%`);
        }
        
        if (filters.address) {
            paramCount++;
            queryText += ` AND LOWER(u.address) LIKE LOWER($${paramCount})`;
            queryParams.push(`%${filters.address}%`);
        }
        
        if (filters.role) {
            paramCount++;
            queryText += ` AND u.role = $${paramCount}`;
            queryParams.push(filters.role);
        }
        
        // Add sorting
        const validSortFields = ['name', 'email', 'role', 'created_at'];
        const sortBy = validSortFields.includes(sorting.sortBy) ? sorting.sortBy : 'created_at';
        const sortOrder = sorting.sortOrder === 'asc' ? 'ASC' : 'DESC';
        
        queryText += ` ORDER BY u.${sortBy} ${sortOrder}`;
        
        const result = await query(queryText, queryParams);
        return result.rows;
        
    } catch (error) {
        throw new Error('Failed to get users with filters');
    }
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserPassword,
    userExistsByEmail,
    getUserStats,
    getAllUsersWithFilters
};