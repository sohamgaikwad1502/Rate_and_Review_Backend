const { query } = require('../config/database');

const createRating = async (ratingData) => {
    try {
        const { user_id, store_id, rating, comment } = ratingData;
        
        const sql = `
            INSERT INTO ratings (user_id, store_id, rating, comment, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *
        `;
        
        const result = await query(sql, [user_id, store_id, rating, comment]);
        return result.rows[0];
    } catch (error) {

        throw error;
    }
};

const findRatingById = async (ratingId) => {
    try {
        const sql = `
            SELECT r.*, u.name as user_name, s.name as store_name
            FROM ratings r
            JOIN users u ON r.user_id = u.id
            JOIN stores s ON r.store_id = s.id
            WHERE r.id = $1
        `;
        
        const result = await query(sql, [ratingId]);
        return result.rows[0] || null;
    } catch (error) {

        throw error;
    }
};

const getRatingsByStore = async (storeId) => {
    try {
        const sql = `
            SELECT r.*, u.name as user_name
            FROM ratings r
            JOIN users u ON r.user_id = u.id
            WHERE r.store_id = $1
            ORDER BY r.created_at DESC
        `;
        
        const result = await query(sql, [storeId]);
        return result.rows;
    } catch (error) {

        throw error;
    }
};

const getRatingsByUser = async (userId) => {
    try {
        const sql = `
            SELECT r.*, s.name as store_name
            FROM ratings r
            JOIN stores s ON r.store_id = s.id
            WHERE r.user_id = $1
            ORDER BY r.created_at DESC
        `;
        
        const result = await query(sql, [userId]);
        return result.rows;
    } catch (error) {

        throw error;
    }
};

const findExistingRating = async (userId, storeId) => {
    try {
        const sql = `
            SELECT * FROM ratings 
            WHERE user_id = $1 AND store_id = $2
        `;
        
        const result = await query(sql, [userId, storeId]);
        return result.rows[0] || null;
    } catch (error) {

        throw error;
    }
};

const updateRating = async (ratingId, updateData) => {
    try {
        const { rating, comment } = updateData;
        
        const sql = `
            UPDATE ratings 
            SET rating = $1, comment = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING *
        `;
        
        const result = await query(sql, [rating, comment, ratingId]);
        return result.rows[0];
    } catch (error) {

        throw error;
    }
};

const deleteRating = async (ratingId) => {
    try {
        const sql = 'DELETE FROM ratings WHERE id = $1 RETURNING *';
        const result = await query(sql, [ratingId]);
        return result.rows[0];
    } catch (error) {

        throw error;
    }
};


const getAverageRating = async (storeId) => {
    try {
        const sql = `
            SELECT 
                COUNT(*) as total_ratings,
                AVG(rating) as average_rating,
                COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
                COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
                COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
                COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
                COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
            FROM ratings 
            WHERE store_id = $1
        `;
        
        const result = await query(sql, [storeId]);
        const stats = result.rows[0];
        
        return {
            total_ratings: parseInt(stats.total_ratings),
            average_rating: stats.average_rating ? parseFloat(stats.average_rating).toFixed(1) : 0,
            star_breakdown: {
                five_star: parseInt(stats.five_star),
                four_star: parseInt(stats.four_star),
                three_star: parseInt(stats.three_star),
                two_star: parseInt(stats.two_star),
                one_star: parseInt(stats.one_star)
            }
        };
    } catch (error) {

        throw error;
    }
};

const getRatingStats = async () => {
    try {
        const sql = `
            SELECT 
                COUNT(*) as total_ratings,
                AVG(rating) as overall_average,
                COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as ratings_this_month
            FROM ratings
        `;
        
        const result = await query(sql);
        return result.rows[0];
    } catch (error) {

        throw error;
    }
};

module.exports = {
    createRating,
    findRatingById,
    getRatingsByStore,
    getRatingsByUser,
    findExistingRating,
    updateRating,
    deleteRating,
    getAverageRating,
    getRatingStats
};
