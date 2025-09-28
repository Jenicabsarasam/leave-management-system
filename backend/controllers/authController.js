// src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const JWT_SECRET = "your_jwt_secret_key"; // later move to .env

// Signup
// backend/controllers/authController.js - Update the signup function
export const signup = async (req, res) => {
  const { name, email, password, role, phone, studentRollNo } = req.body;

  console.log('🔍 Signup request body:', req.body);

  if (!name || !email || !password || !role) {
    console.log('❌ Missing fields:', { name, email, password, role });
    return res.status(400).json({ msg: "All fields required" });
  }

  // For parents, studentRollNo is required
  if (role === 'parent' && !studentRollNo) {
    return res.status(400).json({ msg: "Student roll number is required for parents" });
  }

  // For students, studentRollNo is required
  if (role === 'student' && !studentRollNo) {
    return res.status(400).json({ msg: "Roll number is required for students" });
  }

  try {
    // Check if email exists
    console.log('📧 Checking if email exists:', email);
    const existing = await db.query("SELECT id FROM users WHERE email=$1", [email]);
    
    if (existing.rows.length > 0) {
      console.log('❌ Email already registered:', email);
      return res.status(400).json({ msg: "Email already registered" });
    }

    // For parents: Check if student exists with this roll number
    if (role === 'parent') {
      const studentExists = await db.query(
        "SELECT id FROM users WHERE roll_number=$1 AND role_id=(SELECT id FROM roles WHERE name='student')",
        [studentRollNo]
      );
      
      if (studentExists.rows.length === 0) {
        return res.status(400).json({ msg: "Student with this roll number not found" });
      }
    }

    // Check if roll number already exists for students
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
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get role ID
    console.log('👤 Getting role ID for:', role);
    const roleRes = await db.query("SELECT id FROM roles WHERE name=$1", [role]);
    
    if (roleRes.rows.length === 0) {
      console.log('❌ Invalid role:', role);
      return res.status(400).json({ msg: "Invalid role" });
    }
    
    const roleId = roleRes.rows[0].id;
    console.log('✅ Role ID:', roleId);

    // Insert user
    console.log('💾 Inserting user into database...');
    const result = await db.query(
      "INSERT INTO users(name, email, password, role_id, phone, roll_number) VALUES($1,$2,$3,$4,$5,$6) RETURNING id, name, email, roll_number",
      [name, email, hashedPassword, roleId, phone, studentRollNo]
    );

    const newUser = result.rows[0];
    console.log('✅ User created successfully. ID:', newUser.id);

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
        console.log('✅ Parent-student relationship created');
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
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
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
