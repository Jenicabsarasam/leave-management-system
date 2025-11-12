// src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const JWT_SECRET = "your_jwt_secret_key"; // move to .env in production

// =====================================================
// SIGNUP CONTROLLER
// =====================================================
export const signup = async (req, res) => {
  // ✅ include all expected fields from frontend
  const {
    name,
    email,
    password,
    role,
    phone,
    studentRollNo,
    branch,
    division,
    hostel,
    room_no,
  } = req.body;

  console.log("🔍 Signup request body:", req.body);

  if (!name || !email || !password || !role) {
    return res.status(400).json({ msg: "All required fields must be filled" });
  }

  // ✅ Role-based validation
  if (role === "student") {
    if (!studentRollNo) return res.status(400).json({ msg: "Roll number required for students" });
    if (!branch) return res.status(400).json({ msg: "Branch required for students" });
    if (!division) return res.status(400).json({ msg: "Division required for students" });
    if (!hostel) return res.status(400).json({ msg: "Hostel required for students" });
  }

  if (role === "parent" && !studentRollNo) {
    return res.status(400).json({ msg: "Student roll number required for parents" });
  }

  if (role === "advisor") {
    if (!branch) return res.status(400).json({ msg: "Branch required for advisors" });
    if (!division) return res.status(400).json({ msg: "Division required for advisors" });
  }

  if (role === "warden" && !hostel) {
    return res.status(400).json({ msg: "Hostel required for wardens" });
  }

  try {
    // ✅ 1️⃣ Check for duplicate email
    const existing = await db.query("SELECT id FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // ✅ 2️⃣ Validate student existence for parent role
    if (role === "parent") {
      const studentExists = await db.query(
        "SELECT id FROM users WHERE roll_number=$1 AND role_id=(SELECT id FROM roles WHERE name='student')",
        [studentRollNo]
      );
      if (studentExists.rows.length === 0) {
        return res.status(400).json({ msg: "Student with this roll number not found" });
      }
    }

    // ✅ 3️⃣ Check duplicate roll number for student role
    if (role === "student") {
      const rollExists = await db.query("SELECT id FROM users WHERE roll_number=$1", [studentRollNo]);
      if (rollExists.rows.length > 0) {
        return res.status(400).json({ msg: "Roll number already registered" });
      }
    }

    // ✅ 4️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ 5️⃣ Get role_id
    const roleRes = await db.query("SELECT id FROM roles WHERE name=$1", [role]);
    if (roleRes.rows.length === 0) {
      return res.status(400).json({ msg: "Invalid role" });
    }
    const roleId = roleRes.rows[0].id;

    // ✅ 6️⃣ Convert branch / hostel codes or names to IDs
    let branchId = null;
    let hostelId = null;
    let divisionValue = division || null;

    if (branch) {
      const bRes = await db.query("SELECT id FROM branches WHERE code=$1 OR name=$1", [branch]);
      if (bRes.rows.length > 0) branchId = bRes.rows[0].id;
    }

    if (hostel) {
      const hRes = await db.query("SELECT id FROM hostels WHERE code=$1 OR name=$1", [hostel]);
      if (hRes.rows.length > 0) hostelId = hRes.rows[0].id;
    }

    console.log("💾 Inserting user with:", {
      name,
      email,
      roleId,
      phone,
      studentRollNo,
      branchId,
      divisionValue,
      hostelId,
      room_no,
    });

    // ✅ 7️⃣ Insert new user into DB
    const result = await db.query(
      `INSERT INTO users
        (name, email, password, role_id, phone, roll_number, branch_id, division, hostel_id, room_no)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id, name, email, roll_number, room_no`,
      [
        name,
        email,
        hashedPassword,
        roleId,
        phone || null,
        studentRollNo || null,
        branchId,
        divisionValue,
        hostelId,
        room_no || null,
      ]
    );

    const newUser = result.rows[0];

    // ✅ 8️⃣ If parent, link to child student
    if (role === "parent") {
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

    // ✅ 9️⃣ Return success response
    res.status(201).json({
      msg: "User created successfully",
      user: { ...newUser, role },
    });
  } catch (err) {
    console.error("💥 SIGNUP ERROR:", err);
    res.status(500).json({
      msg: "Server error during signup",
      error: err.message,
    });
  }
};

// =====================================================
// LOGIN CONTROLLER
// =====================================================
export const login = async (req, res) => {
  const { email, password, role } = req.body; // 👈 add role here

  try {
    const userRes = await db.query(
      `SELECT u.id, u.name, u.email, u.password, r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    if (userRes.rows.length === 0)
      return res.status(400).json({ msg: "Invalid credentials" });

    const user = userRes.rows[0];

    // 🧂 Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // 🚨 Check if role matches
    if (role && user.role !== role) {
      return res.status(403).json({
        msg: `Role mismatch: You are registered as ${user.role}, not ${role}`,
      });
    }

    // ✅ Generate token after role validation
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Send response
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error during login" });
  }
};
