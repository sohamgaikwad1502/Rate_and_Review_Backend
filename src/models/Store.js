const { query } = require('../config/database');

const createStore = async (storeData) => {
    try {
        const { name, email, address, owner_id } = storeData;
        
        const sql = `
            INSERT INTO stores (name, email, address, owner_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *
        `;
        
        const result = await query(sql, [name, email, address, owner_id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating store:', error);
        throw error;
    }
};

const findStoreById = async (storeId) => {
    try {
        const sql = `
            SELECT s.*, u.name as owner_name, u.email as owner_email
            FROM stores s
            JOIN users u ON s.owner_id = u.id
            WHERE s.id = $1
        `;
        
        const result = await query(sql, [storeId]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding store by ID:', error);
        throw error;
    }
};

const findStoreByEmail = async (email) => {
    try {
        const sql = 'SELECT * FROM stores WHERE email = $1';
        const result = await query(sql, [email]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error finding store by email:', error);
        throw error;
    }
};

const getAllStores = async () => {
    try {
        const sql = `
            SELECT s.*, u.name as owner_name
            FROM stores s
            JOIN users u ON s.owner_id = u.id
            ORDER BY s.created_at DESC
        `;
        
        const result = await query(sql);
        return result.rows;
    } catch (error) {
        console.error('Error getting all stores:', error);
        throw error;
    }
};

const getStoresByOwner = async (ownerId) => {
    try {
        const sql = `
            SELECT * FROM stores 
            WHERE owner_id = $1 
            ORDER BY created_at DESC
        `;
        
        const result = await query(sql, [ownerId]);
        return result.rows;
    } catch (error) {
        console.error('Error getting stores by owner:', error);
        throw error;
    }
};

const updateStore = async (storeId, updateData) => {
    try {
        const { name, email, address } = updateData;
        
        const sql = `
            UPDATE stores 
            SET name = $1, email = $2, address = $3, updated_at = NOW()
            WHERE id = $4
            RETURNING *
        `;
        
        const result = await query(sql, [name, email, address, storeId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating store:', error);
        throw error;
    }
};
const deleteStore = async (storeId) => {
    try {
        const sql = 'DELETE FROM stores WHERE id = $1 RETURNING *';
        const result = await query(sql, [storeId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting store:', error);
        throw error;
    }
};

const storeExistsByEmail = async (email) => {
    try {
        const sql = 'SELECT id FROM stores WHERE email = $1';
        const result = await query(sql, [email]);
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error checking store existence:', error);
        throw error;
    }
};

const getStoreStats = async () => {
    try {
        const sql = `
            SELECT 
                COUNT(*) as total_stores,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as stores_this_month
            FROM stores
        `;
        
        const result = await query(sql);
        return result.rows[0];
    } catch (error) {
        console.error('Error getting store statistics:', error);
        throw error;
    }
};

const getAllStoresWithFilters = async (filters = {}, sorting = {}) => {
    try {
        let queryText = `
            SELECT s.*, u.name as owner_name
            FROM stores s
            JOIN users u ON s.owner_id = u.id
            WHERE 1=1
        `;
        
        const queryParams = [];
        let paramCount = 0;
        
        // Add filters
        if (filters.name) {
            paramCount++;
            queryText += ` AND LOWER(s.name) LIKE LOWER($${paramCount})`;
            queryParams.push(`%${filters.name}%`);
        }
        
        if (filters.email) {
            paramCount++;
            queryText += ` AND LOWER(s.email) LIKE LOWER($${paramCount})`;
            queryParams.push(`%${filters.email}%`);
        }
        
        if (filters.address) {
            paramCount++;
            queryText += ` AND LOWER(s.address) LIKE LOWER($${paramCount})`;
            queryParams.push(`%${filters.address}%`);
        }
        
        const validSortFields = ['name', 'email', 'address', 'created_at'];
        const sortBy = validSortFields.includes(sorting.sortBy) ? sorting.sortBy : 'created_at';
        const sortOrder = sorting.sortOrder === 'asc' ? 'ASC' : 'DESC';
        
        queryText += ` ORDER BY s.${sortBy} ${sortOrder}`;
        
        const result = await query(queryText, queryParams);
        return result.rows;
        
    } catch (error) {
        console.error('Error in getAllStoresWithFilters:', error);
        throw new Error('Failed to get stores with filters');
    }
};

module.exports = {
    createStore,
    findStoreById,
    findStoreByEmail,
    getAllStores,
    getStoresByOwner,
    updateStore,
    deleteStore,
    storeExistsByEmail,
    getStoreStats,
    getAllStoresWithFilters
};