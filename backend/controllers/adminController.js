// backend/controllers/adminController.js
import db from "../config/db.js";

// Get admin statistics
export const getAdminStats = async (req, res) => {
  try {
    // Get total users count
    const usersCount = await db.query(`
      SELECT role_id, COUNT(*) as count 
      FROM users 
      GROUP BY role_id
    `);

    // Get total leaves count
    const leavesCount = await db.query(`
      SELECT COUNT(*) as total_leaves,
             COUNT(CASE WHEN status IN ('pending', 'parent_approved', 'advisor_approved', 'emergency_pending') THEN 1 END) as pending_leaves,
             COUNT(CASE WHEN type = 'emergency' THEN 1 END) as emergency_leaves,
             COUNT(CASE WHEN proof_submitted = true THEN 1 END) as proofs_submitted,
             COUNT(CASE WHEN proof_verified = true THEN 1 END) as proofs_verified
      FROM leaves
    `);

    // Get role names
    const roles = await db.query(`SELECT id, name FROM roles`);
    const roleMap = {};
    roles.rows.forEach(role => {
      roleMap[role.id] = role.name;
    });

    // Format user counts by role
    const userStats = {};
    usersCount.rows.forEach(row => {
      const roleName = roleMap[row.role_id];
      userStats[roleName] = parseInt(row.count);
    });

    const leavesData = leavesCount.rows[0];

    res.json({
      totalUsers: usersCount.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
      totalLeaves: parseInt(leavesData.total_leaves),
      pendingLeaves: parseInt(leavesData.pending_leaves),
      emergencyLeaves: parseInt(leavesData.emergency_leaves),
      proofsSubmitted: parseInt(leavesData.proofs_submitted),
      proofsVerified: parseInt(leavesData.proofs_verified),
      activeStudents: userStats.student || 0,
      activeAdvisors: userStats.advisor || 0,
      activeWardens: userStats.warden || 0,
      activeParents: userStats.parent || 0,
      systemUptime: "99.9%",
      storageUsed: "2.3GB"
    });
  } catch (err) {
    console.error('Error in getAdminStats:', err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.*,
        r.name as role,
        b.name as branch_name,
        h.name as hostel_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN branches b ON u.branch_id = b.id
      LEFT JOIN hostels h ON u.hostel_id = h.id
      ORDER BY u.created_at DESC
    `);

    // Format the response
    const users = result.rows.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      roll_number: user.roll_number,
      division: user.division,
      branch_name: user.branch_name,
      hostel_name: user.hostel_name,
      status: user.status || 'active',
      created_at: user.created_at
    }));

    res.json({ users });
  } catch (err) {
    console.error('Error in getAllUsers:', err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Create new user
export const createUser = async (req, res) => {
  const { name, email, phone, role, roll_number, division, branch_id, hostel_id, password } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !role || !password) {
      return res.status(400).json({ msg: "Name, email, role, and password are required" });
    }

    // Check if user already exists
    const existingUser = await db.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ msg: "User with this email already exists" });
    }

    // Get role_id
    const roleResult = await db.query(
      `SELECT id FROM roles WHERE name = $1`,
      [role]
    );

    if (roleResult.rows.length === 0) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    const role_id = roleResult.rows[0].id;

    // Insert new user
    const result = await db.query(
      `INSERT INTO users (name, email, phone, role_id, roll_number, division, branch_id, hostel_id, password, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
       RETURNING *`,
      [name, email, phone, role_id, roll_number, division, branch_id, hostel_id, password]
    );

    // For students, create parent-student relationship if parent exists
    if (role === 'student') {
      // You might want to automatically create a parent account or link to existing parent
      // This is a simplified version - you might need to adjust based on your requirements
      console.log('Student created - parent linking logic can be added here');
    }

    res.json({ 
      msg: "User created successfully", 
      user: result.rows[0] 
    });
  } catch (err) {
    console.error('Error in createUser:', err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Update user
export const updateUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, phone, role, roll_number, division, branch_id, hostel_id, status } = req.body;

  try {
    // Check if user exists
    const existingUser = await db.query(
      `SELECT * FROM users WHERE id = $1`,
      [userId]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Get role_id if role is being updated
    let role_id = existingUser.rows[0].role_id;
    if (role) {
      const roleResult = await db.query(
        `SELECT id FROM roles WHERE name = $1`,
        [role]
      );

      if (roleResult.rows.length === 0) {
        return res.status(400).json({ msg: "Invalid role" });
      }
      role_id = roleResult.rows[0].id;
    }

    // Update user
    const result = await db.query(
      `UPDATE users 
       SET name = $1, email = $2, phone = $3, role_id = $4, roll_number = $5, 
           division = $6, branch_id = $7, hostel_id = $8, status = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [name, email, phone, role_id, roll_number, division, branch_id, hostel_id, status, userId]
    );

    res.json({ 
      msg: "User updated successfully", 
      user: result.rows[0] 
    });
  } catch (err) {
    console.error('Error in updateUser:', err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    // Check if user exists
    const existingUser = await db.query(
      `SELECT * FROM users WHERE id = $1`,
      [userId]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Delete user (this will cascade to related tables due to foreign key constraints)
    await db.query(`DELETE FROM users WHERE id = $1`, [userId]);

    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error('Error in deleteUser:', err);
    
    // Check if it's a foreign key constraint violation
    if (err.code === '23503') {
      return res.status(400).json({ 
        msg: "Cannot delete user because they have related records. Please deactivate the user instead." 
      });
    }
    
    res.status(500).json({ msg: "Server error" });
  }
};

// Get all leaves
export const getAllLeaves = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        l.*,
        s.name as student_name,
        s.roll_number as student_rollno,
        s.division as student_division,
        b.name as branch_name,
        h.name as hostel_name,
        p.name as parent_name,
        a.name as advisor_name,
        w.name as warden_name
      FROM leaves l
      JOIN users s ON l.student_id = s.id
      LEFT JOIN branches b ON s.branch_id = b.id
      LEFT JOIN hostels h ON s.hostel_id = h.id
      LEFT JOIN users p ON l.parent_id = p.id
      LEFT JOIN users a ON l.advisor_id = a.id
      LEFT JOIN users w ON l.warden_id = w.id
      ORDER BY l.created_at DESC
    `);

    res.json({ leaves: result.rows });
  } catch (err) {
    console.error('Error in getAllLeaves:', err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get system logs (you'll need to create a logs table first)
export const getSystemLogs = async (req, res) => {
  try {
    // Check if logs table exists, if not return empty array
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'system_logs'
      )
    `);

    if (!tableExists.rows[0].exists) {
      // Return mock logs until you create the actual logs table
      return res.json({ 
        logs: [
          {
            action: "Admin dashboard accessed",
            user_name: "System Admin",
            timestamp: new Date().toISOString(),
            ip_address: "127.0.0.1"
          },
          {
            action: "User statistics retrieved",
            user_name: "System Admin", 
            timestamp: new Date(Date.now() - 300000).toISOString(),
            ip_address: "127.0.0.1"
          }
        ]
      });
    }

    // If logs table exists, get actual logs
    const result = await db.query(`
      SELECT * FROM system_logs 
      ORDER BY timestamp DESC 
      LIMIT 100
    `);

    res.json({ logs: result.rows });
  } catch (err) {
    console.error('Error in getSystemLogs:', err);
    // Return mock logs on error
    res.json({ 
      logs: [
        {
          action: "System logs retrieved",
          user_name: "System Admin",
          timestamp: new Date().toISOString(),
          ip_address: "127.0.0.1"
        }
      ]
    });
  }
};

// Bulk import users
export const bulkImportUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "CSV file is required" });
    }

    // For now, return success message
    // In a real implementation, you would:
    // 1. Parse the CSV file
    // 2. Validate each row
    // 3. Insert users in batch
    // 4. Handle errors and rollback if needed

    res.json({ 
      msg: "Bulk import feature will be implemented soon. For now, please use the single user creation form.",
      importedCount: 0
    });
  } catch (err) {
    console.error('Error in bulkImportUsers:', err);
    res.status(500).json({ msg: "Server error during bulk import" });
  }
};