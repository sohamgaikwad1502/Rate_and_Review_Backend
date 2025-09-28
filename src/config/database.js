const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,

    max: 10,
    min: 0,
    idle: 10000,
    acquire: 60000,
});

const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Database connected successfully');
        
        const result = await client.query('SELECT NOW()');
        console.log('Database time:', result.rows[0].now);
        
        client.release(); 
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        return false;
    }
};

const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: result.rowCount });
        
        return result;
    } catch (error) {
        console.error('Query error:', error.message);
        throw error;
    }
};

const getClient = async () => {
    return await pool.connect();
};

const closePool = async () => {
    await pool.end();
    console.log('Database connection pool closed');
};

module.exports = {
    pool,
    query,
    getClient,
    testConnection,
    closePool
};