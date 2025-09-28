import express from "express";
import { applyLeave, getLeaves, parentApproveLeave, advisorReviewLeave, wardenApproveLeave, confirmArrival} from "../controllers/leaveController.js";
import { verifyToken, permit } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student applies for leave
router.post("/apply", verifyToken, permit("student"), applyLeave);

// Get all leaves for the logged-in user
router.get("/my", verifyToken, getLeaves);
// Parent approves or rejects leave
router.post("/:id/approve", verifyToken, permit("parent"), parentApproveLeave);
// Advisor review route
router.post("/:id/review", verifyToken, permit("advisor"), advisorReviewLeave);
// Warden approval route
router.post("/:id/warden", verifyToken, permit("warden"), wardenApproveLeave);
// Parent confirms arrival
router.post("/:id/arrival", verifyToken, permit("parent"), confirmArrival);

export default router;
