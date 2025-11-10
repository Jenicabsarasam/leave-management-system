// backend/config/db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',                    // Your PostgreSQL username
  host: 'localhost',
  database: 'leave_management', 
  password: 'Jeni@2004',    // ← Replace with your actual password
  port: 5432,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

export default pool;