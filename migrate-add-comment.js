require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
    try {
        console.log('Connecting to database...');
        const client = await pool.connect();
        
        console.log('Adding comment column to ratings table...');
        await client.query(`
            ALTER TABLE ratings ADD COLUMN IF NOT EXISTS comment TEXT DEFAULT '';
        `);
        
        console.log('✓ Migration completed successfully!');
        console.log('✓ Comment column added to ratings table');
        
        client.release();
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('✗ Migration failed:', error.message);
        await pool.end();
        process.exit(1);
    }
}

migrate();
