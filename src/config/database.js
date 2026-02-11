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
        console.log("Database Connected Successfully")
        await client.query('SELECT NOW()');
        client.release(); 
        return true;
    } catch (error) {
        return false;
    }
};

const query = async (text, params) => {
    try {
        const result = await pool.query(text, params);
        return result;
    } catch (error) {
        throw error;
    }
};

const getClient = async () => {
    return await pool.connect();
};

const closePool = async () => {
    await pool.end();
};

module.exports = {
    pool,
    query,
    getClient,
    testConnection,
    closePool
};