// backend/database/init.js
import db from '../config/db.js';

export const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // Create roles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      )
    `);
    console.log('✅ Roles table created/verified');

    // Insert default roles
    await db.query(`
      INSERT INTO roles (name) VALUES 
      ('student'), 
      ('parent'), 
      ('advisor'), 
      ('warden'), 
      ('admin')
      ON CONFLICT (name) DO NOTHING
    `);
    console.log('✅ Default roles inserted');

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role_id INTEGER REFERENCES roles(id),
        phone VARCHAR(20),
        roll_number VARCHAR(50), -- For students: roll number, for parents: child's roll number
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created/verified');

    // Create parent_student relationship table
    await db.query(`
      CREATE TABLE IF NOT EXISTS parent_student (
        id SERIAL PRIMARY KEY,
        parent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        relationship VARCHAR(50) DEFAULT 'parent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(parent_id, student_id)
      )
    `);
    console.log('✅ Parent-Student relationship table created');

    // Create leaves table
    await db.query(`
      CREATE TABLE IF NOT EXISTS leaves (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id),
        parent_id INTEGER REFERENCES users(id),
        advisor_id INTEGER REFERENCES users(id),
        warden_id INTEGER REFERENCES users(id),
        reason TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        type VARCHAR(20) DEFAULT 'normal',
        status VARCHAR(50) DEFAULT 'pending',
        qr_code TEXT,
        arrival_timestamp TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Leaves table created/verified');

    console.log('🎉 Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};