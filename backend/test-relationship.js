// backend/test-relationship.js
import db from './config/db.js';

async function testRelationship() {
  try {
    console.log("🔍 Testing parent-student relationships...");
    
    // Get all users
    const users = await db.query(`
      SELECT u.id, u.name, u.email, u.roll_number, r.name as role 
      FROM users u 
      JOIN roles r ON u.role_id = r.id
    `);
    console.log("👥 All users:", users.rows);
    
    // Get all parent-student relationships
    const relationships = await db.query(`
      SELECT ps.*, 
        parent.name as parent_name, 
        parent.roll_number as parent_roll,
        student.name as student_name,
        student.roll_number as student_rollno
      FROM parent_student ps
      JOIN users parent ON ps.parent_id = parent.id
      JOIN users student ON ps.student_id = student.id
    `);
    console.log("👨‍👦 Parent-Student relationships:", relationships.rows);
    
    // Get all leaves
    const leaves = await db.query(`
      SELECT l.*, 
        s.name as student_name, 
        s.roll_number as student_rollno,
        p.name as parent_name
      FROM leaves l
      JOIN users s ON l.student_id = s.id
      LEFT JOIN users p ON l.parent_id = p.id
    `);
    console.log("📋 All leaves:", leaves.rows);
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testRelationship();