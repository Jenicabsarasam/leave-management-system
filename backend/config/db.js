// backend/db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'your_db_user',       // replace with your DB username
  host: 'localhost',
  database: 'leave_management', // your DB name
  password: 'Jeni@2004',       // your DB password
  port: 5432,
});

export default {
  query: (text, params) => pool.query(text, params),
};
