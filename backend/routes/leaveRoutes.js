// backend/routes/leaveRoutes.js
import express from "express";
import { 
  applyLeave, 
  getLeaves, 
  parentApproveLeave, 
  advisorReviewLeave, 
  wardenApproveLeave, 
  wardenEmergencyApprove,
  confirmArrival,
  getQRCode,
  uploadProof,
  verifyProof,
  getStudentsSummary
} from "../controllers/leaveController.js";
import { verifyToken, permit } from "../middleware/authMiddleware.js";

const router = express.Router();

// Import multer for file uploads
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs'; // Import fs at the top

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const proofsDir = path.join(__dirname, '../uploads/proofs/');
if (!fs.existsSync(proofsDir)) {
  fs.mkdirSync(proofsDir, { recursive: true });
}

// Configure multer for file uploads - INCREASED FILE SIZE LIMIT
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use absolute path to ensure correct directory
    const destinationPath = path.join(__dirname, '../uploads/proofs/');
    console.log('📁 Saving file to:', destinationPath);
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Clean filename and ensure .pdf extension
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = 'proof-' + uniqueSuffix + '-' + cleanName;
    console.log('📄 Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log('📋 File filter - MIME type:', file.mimetype);
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      console.log('❌ Invalid file type:', file.mimetype);
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // INCREASED to 10MB limit
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  console.log('🔄 Multer error handler:', error.message);
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        msg: 'File too large. Maximum size is 10MB. Please compress your PDF or use a smaller file.' 
      });
    }
    return res.status(400).json({ msg: 'File upload error: ' + error.message });
  } else if (error) {
    return res.status(400).json({ msg: error.message });
  }
  next();
};

// Existing routes
router.post("/apply", verifyToken, permit("student"), applyLeave);
router.get("/my", verifyToken, getLeaves);
router.post("/:id/approve", verifyToken, permit("parent"), parentApproveLeave);
router.post("/:id/review", verifyToken, permit("advisor"), advisorReviewLeave);
router.post("/:id/warden", verifyToken, permit("warden"), wardenApproveLeave);
router.post("/:id/emergency-approve", verifyToken, permit("warden"), wardenEmergencyApprove);
router.post("/:id/arrival", verifyToken, permit("parent"), confirmArrival);
router.get("/:id/qrcode", verifyToken, getQRCode);

// New routes with multer error handling
router.post("/:id/upload-proof", 
  verifyToken, 
  permit("parent"), 
  (req, res, next) => {
    console.log('📤 Upload proof route hit for leave:', req.params.id);
    next();
  },
  upload.single('proof'), 
  (req, res, next) => {
    if (req.file) {
      console.log('✅ File uploaded successfully:', req.file.filename, 'Size:', req.file.size, 'bytes');
      // Verify file exists using the imported fs
      if (fs.existsSync(req.file.path)) {
        console.log('✅ File verified on disk');
      } else {
        console.log('❌ File not found on disk after upload');
      }
    } else {
      console.log('❌ No file in request');
    }
    next();
  },
  handleMulterError,
  uploadProof
);

router.post("/:id/verify-proof", verifyToken, permit("advisor"), verifyProof);
router.get("/advisor/students-summary", verifyToken, permit("advisor"), getStudentsSummary);

export default router;