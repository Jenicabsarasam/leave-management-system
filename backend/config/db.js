// backend/config/db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'Leave-Mangement',
  password: process.env.PGPASSWORD || '12345',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5433,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

export default pool;