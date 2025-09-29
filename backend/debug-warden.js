// backend/debug-warden.js
import db from './config/db.js';

async function debugWarden() {
  try {
    console.log("🔍 Debugging warden and student assignments...");
    
    // Get all wardens and their hostel assignments
    const wardens = await db.query(`
      SELECT u.id, u.name, u.email, h.name as hostel_name
      FROM users u 
      LEFT JOIN hostels h ON u.hostel_id = h.id
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'warden'
    `);
    
    console.log("🏠 Wardens and their hostel assignments:");
    console.table(wardens.rows);
    
    // Get all students and their hostel assignments
    const students = await db.query(`
      SELECT u.id, u.name, u.roll_number, h.name as hostel_name
      FROM users u 
      LEFT JOIN hostels h ON u.hostel_id = h.id
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'student'
    `);
    
    console.log("👨‍🎓 Students and their hostel assignments:");
    console.table(students.rows);
    
    // Get all leaves with their status and student hostel
    const leaves = await db.query(`
      SELECT l.id, l.status, s.name as student_name, 
             h.name as student_hostel,
             p.name as parent_name,
             a.name as advisor_name,
             w.name as warden_name
      FROM leaves l
      JOIN users s ON l.student_id = s.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN users p ON l.parent_id = p.id
      LEFT JOIN users a ON l.advisor_id = a.id
      LEFT JOIN users w ON l.warden_id = w.id
      ORDER BY l.status, l.id
    `);
    
    console.log("📋 All leaves with status and student hostel:");
    console.table(leaves.rows);
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

debugWarden();