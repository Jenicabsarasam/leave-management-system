import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import users from "../models/User.js";

// Secret for JWT (later move to .env)
const JWT_SECRET = "your_jwt_secret_key";

export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Simple validation
  if (!name || !email || !password || !role)
    return res.status(400).json({ msg: "All fields required" });

  // Check if user exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) return res.status(400).json({ msg: "Email already registered" });

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Save user
  const newUser = { id: users.length + 1, name, email, password: hashedPassword, role };
  users.push(newUser);

  res.status(201).json({ msg: "User created", user: { id: newUser.id, name, email, role } });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ msg: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

  // Generate JWT
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};
