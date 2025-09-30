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

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/proofs/'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'proof-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Existing routes
router.post("/apply", verifyToken, permit("student"), applyLeave);
router.get("/my", verifyToken, getLeaves);
router.post("/:id/approve", verifyToken, permit("parent"), parentApproveLeave);
router.post("/:id/review", verifyToken, permit("advisor"), advisorReviewLeave);
router.post("/:id/warden", verifyToken, permit("warden"), wardenApproveLeave);
router.post("/:id/emergency-approve", verifyToken, permit("warden"), wardenEmergencyApprove);
router.post("/:id/arrival", verifyToken, permit("parent"), confirmArrival);
router.get("/:id/qrcode", verifyToken, getQRCode);

// New routes
router.post("/:id/upload-proof", verifyToken, permit("parent"), upload.single('proof'), uploadProof);
router.post("/:id/verify-proof", verifyToken, permit("advisor"), verifyProof);
router.get("/advisor/students-summary", verifyToken, permit("advisor"), getStudentsSummary);

export default router;