// backend/server.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { initDatabase } from "./database/init.js";
import db from "./config/db.js";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration

app.use(cors({
  origin: "http://localhost:5173", // 👈 your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true                // 👈 if you send cookies or tokens
}));

app.use(express.json());

// IMPORTANT: Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const proofsDir = path.join(__dirname, 'uploads', 'proofs');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

if (!fs.existsSync(proofsDir)) {
  fs.mkdirSync(proofsDir, { recursive: true });
  console.log('✅ Created uploads/proofs directory');
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize database on startup
initDatabase().then(() => {
  console.log('Database initialized successfully');
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

// Routes
app.use("/auth", authRoutes);
app.use("/leave", leaveRoutes);
app.use("/admin", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Health check
app.get("/health", async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      database: 'Disconnected',
      error: error.message 
    });
  }
});

const PORT = 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));