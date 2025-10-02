// createAdmin-simple.js
import bcrypt from 'bcryptjs';
import db from './config/db.js';

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Ensure admin role exists
    await db.query(`
      INSERT INTO roles (name) 
      VALUES ('admin') 
      ON CONFLICT (name) DO NOTHING
    `);

    // Get admin role ID
    const roleResult = await db.query(
      'SELECT id FROM roles WHERE name = $1',
      ['admin']
    );
    const roleId = roleResult.rows[0].id;

    // Create admin user with only essential columns
    await db.query(`
      INSERT INTO users (name, email, password, role_id) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET password = $3, role_id = $4
    `, ['System Admin', 'admin@college.edu', hashedPassword, roleId]);

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@college.edu');
    console.log('🔑 Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdminUser();