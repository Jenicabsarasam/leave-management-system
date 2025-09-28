import express from "express";
import { applyLeave, getLeaves } from "../controllers/leaveController.js";
import { verifyToken, permit } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student applies for leave
router.post("/apply", verifyToken, permit("student"), applyLeave);

// Get all leaves for the logged-in user
router.get("/my", verifyToken, getLeaves);

export default router;
