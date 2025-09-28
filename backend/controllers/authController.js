// src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const JWT_SECRET = "your_jwt_secret_key"; // later move to .env

// Signup
export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role)
    return res.status(400).json({ msg: "All fields required" });

  try {
    // Check if email exists
    const existing = await db.query("SELECT id FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0) return res.status(400).json({ msg: "Email already registered" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get role ID
    const roleRes = await db.query("SELECT id FROM roles WHERE name=$1", [role]);
    if (roleRes.rows.length === 0) return res.status(400).json({ msg: "Invalid role" });
    const roleId = roleRes.rows[0].id;

    // Insert user
    const result = await db.query(
      "INSERT INTO users(name, email, password, role_id) VALUES($1,$2,$3,$4) RETURNING id, name, email",
      [name, email, hashedPassword, roleId]
    );

    const newUser = result.rows[0];
    res.status(201).json({ msg: "User created", user: { ...newUser, role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
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
