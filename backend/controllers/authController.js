// src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const JWT_SECRET = "your_jwt_secret_key"; // later move to .env

// Signup
export const signup = async (req, res) => {
  const { name, email, password, role, phone, studentRollNo, branch, division, hostel } = req.body;

  console.log('🔍 Signup request body:', req.body);

  if (!name || !email || !password || !role) {
    console.log('❌ Missing fields:', { name, email, password, role });
    return res.status(400).json({ msg: "All fields required" });
  }

  // Field validation based on role
  if (role === 'student') {
    if (!studentRollNo) return res.status(400).json({ msg: "Roll number required for students" });
    if (!branch) return res.status(400).json({ msg: "Branch required for students" });
    if (!division) return res.status(400).json({ msg: "Division required for students" });
    if (!hostel) return res.status(400).json({ msg: "Hostel required for students" });
  }

  if (role === 'parent' && !studentRollNo) {
    return res.status(400).json({ msg: "Student roll number required for parents" });
  }

  if (role === 'advisor') {
    if (!branch) return res.status(400).json({ msg: "Branch required for advisors" });
    if (!division) return res.status(400).json({ msg: "Division required for advisors" });
  }

  if (role === 'warden' && !hostel) {
    return res.status(400).json({ msg: "Hostel required for wardens" });
  }

  try {
    // Check if email exists
    const existing = await db.query("SELECT id FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // For parents: Check if student exists
    if (role === 'parent') {
      const studentExists = await db.query(
        "SELECT id FROM users WHERE roll_number=$1 AND role_id=(SELECT id FROM roles WHERE name='student')",
        [studentRollNo]
      );
      if (studentExists.rows.length === 0) {
        return res.status(400).json({ msg: "Student with this roll number not found" });
      }
    }

    // For students: Check if roll number exists
    if (role === 'student') {
      const rollNumberExists = await db.query(
        "SELECT id FROM users WHERE roll_number=$1",
        [studentRollNo]
      );
      if (rollNumberExists.rows.length > 0) {
        return res.status(400).json({ msg: "Roll number already registered" });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get role ID
    const roleRes = await db.query("SELECT id FROM roles WHERE name=$1", [role]);
    if (roleRes.rows.length === 0) {
      return res.status(400).json({ msg: "Invalid role" });
    }
    const roleId = roleRes.rows[0].id;

    // ------------------ 🔽 New insertion logic 🔽 ------------------

    // Insert user - handle NULL values for branch_id, division, hostel_id based on role
    let branchId = null;
    let divisionValue = null; 
    let hostelId = null;

    if (role === 'student' || role === 'advisor') {
      if (branch) {
        const branchRes = await db.query("SELECT id FROM branches WHERE code=$1", [branch]);
        if (branchRes.rows.length > 0) {
          branchId = branchRes.rows[0].id;
        }
      }
      
      divisionValue = division; // Set division for students and advisors
    }

    if (role === 'student' || role === 'warden') {
      if (hostel) {
        const hostelRes = await db.query("SELECT id FROM hostels WHERE code=$1", [hostel]);
        if (hostelRes.rows.length > 0) {
          hostelId = hostelRes.rows[0].id;
        }
      }
    }

    // For parents, all these should be NULL
    if (role === 'parent') {
      branchId = null;
      divisionValue = null;
      hostelId = null;
    }

    console.log('💾 Inserting user with values:', {
      name, email, roleId, phone, studentRollNo, 
      branchId, division: divisionValue, hostelId
    });

    // Insert user
    const result = await db.query(
      `INSERT INTO users(name, email, password, role_id, phone, roll_number, branch_id, division, hostel_id) 
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) 
       RETURNING id, name, email, roll_number`,
      [name, email, hashedPassword, roleId, phone, studentRollNo, branchId, divisionValue, hostelId]
    );

    // ------------------ 🔼 End of insertion logic 🔼 ------------------

    const newUser = result.rows[0];

    // Create parent-student relationship if role is parent
    if (role === 'parent') {
      const student = await db.query(
        "SELECT id FROM users WHERE roll_number=$1 AND role_id=(SELECT id FROM roles WHERE name='student')",
        [studentRollNo]
      );
      if (student.rows.length > 0) {
        await db.query(
          "INSERT INTO parent_student (parent_id, student_id) VALUES ($1, $2)",
          [newUser.id, student.rows[0].id]
        );
      }
    }
    
    res.status(201).json({ 
      msg: "User created successfully", 
      user: { 
        ...newUser, 
        role: role 
      } 
    });
    
  } catch (err) {
    console.error('💥 SIGNUP ERROR:', err);
    res.status(500).json({ 
      msg: "Server error during signup",
      error: err.message 
    });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRes = await db.query(
      `SELECT u.id, u.name, u.email, u.password, r.name as role
       FROM users u
       JOIN roles r ON u.role_id=r.id
       WHERE u.email=$1`,
      [email]
    );

    if (userRes.rows.length === 0) return res.status(400).json({ msg: "Invalid credentials" });

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
