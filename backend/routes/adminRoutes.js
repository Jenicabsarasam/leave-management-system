// backend/routes/adminRoutes.js
import express from "express";
import { 
  getAdminStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllLeaves,
  getSystemLogs,
  bulkImportUsers
} from "../controllers/adminController.js";
import { verifyToken, permit } from "../middleware/authMiddleware.js";

// Add multer for file uploads in bulk import
import multer from "multer";
const upload = multer({ dest: 'uploads/temp/' });

const router = express.Router();

router.get("/stats", verifyToken, permit("admin"), getAdminStats);
router.get("/users", verifyToken, permit("admin"), getAllUsers);
router.post("/users", verifyToken, permit("admin"), createUser);
router.put("/users/:id", verifyToken, permit("admin"), updateUser);
router.delete("/users/:id", verifyToken, permit("admin"), deleteUser);
router.get("/leaves", verifyToken, permit("admin"), getAllLeaves);
router.get("/logs", verifyToken, permit("admin"), getSystemLogs);
router.post("/users/bulk-import", verifyToken, permit("admin"), upload.single('file'), bulkImportUsers);

export default router;