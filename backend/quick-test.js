// backend/quick-test.js
import db from './config/db.js';

async function test() {
  try {
    console.log('Testing database connection...');
    const result = await db.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    
    console.log('Testing roles table...');
    const roles = await db.query('SELECT * FROM roles');
    console.log('✅ Roles:', roles.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();