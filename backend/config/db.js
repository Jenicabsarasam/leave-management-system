// backend/config/db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'leave_management',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

export default pool;