// backend/controllers/leaveController.js
import QRCode from "qrcode";
// In-memory storage for now
const leaves = [];

// Student applies for leave
export const applyLeave = (req, res) => {
  const { reason, startDate, endDate } = req.body;
  if (!reason || !startDate || !endDate)
    return res.status(400).json({ msg: "All fields required" });

  const newLeave = {
    id: leaves.length + 1,
    studentId: req.user.id,
    reason,
    startDate,
    endDate,
    status: "pending",      // workflow starts as pending
    parentId: null,         // who approved/rejected
    advisorId: null,        // who reviewed
    wardenId: null,         // who finalized
    qrCode: null,           // for security
    exitConfirmed: false,   // for security confirmation
    arrivalTimestamp: null  // for parent arrival confirmation
  };

  leaves.push(newLeave);
  res.status(201).json({ msg: "Leave applied", leave: newLeave });
};

// Get leaves for the logged-in user
export const getLeaves = (req, res) => {
  let userLeaves = [];

  switch (req.user.role) {
    case "student":
      userLeaves = leaves.filter(l => l.studentId === req.user.id);
      break;
    case "parent":
      userLeaves = leaves.filter(l => l.parentId === req.user.id || l.studentId === req.user.childId);
      break;
    case "advisor":
      userLeaves = leaves; // For simplicity, advisor can see all leaves
      break;
    case "warden":
      userLeaves = leaves; // Warden sees all leaves
      break;
    default:
      userLeaves = [];
  }

  res.json({ leaves: userLeaves });
};

// Parent approves or rejects a leave
export const parentApproveLeave = (req, res) => {
  const leaveId = parseInt(req.params.id);
  const { action } = req.body; // "approve" or "reject"

  const leave = leaves.find(l => l.id === leaveId);
  if (!leave) return res.status(404).json({ msg: "Leave not found" });

  if (action !== "approve" && action !== "reject")
    return res.status(400).json({ msg: 'Action must be "approve" or "reject"' });

  leave.status = action === "approve" ? "parent_approved" : "rejected";
  leave.parentId = req.user.id;

  res.json({ msg: `Leave ${leave.status}`, leave });
};

export const advisorReviewLeave = (req, res) => {
  const leaveId = parseInt(req.params.id);
  const { action } = req.body; // "approve" or "reject"

  const leave = leaves.find(l => l.id === leaveId);
  if (!leave) return res.status(404).json({ msg: "Leave not found" });

  // Advisor can only review if parent approved
  if (leave.status !== "parent_approved")
    return res.status(400).json({ msg: "Leave must be approved by parent first" });

  if (action !== "approve" && action !== "reject")
    return res.status(400).json({ msg: 'Action must be "approve" or "reject"' });

  leave.status = action === "approve" ? "advisor_approved" : "rejected";
  leave.advisorId = req.user.id;

  res.json({ msg: `Leave ${leave.status}`, leave });
};


export const wardenApproveLeave = async (req, res) => {
  const leaveId = parseInt(req.params.id);
  const { action } = req.body; // "approve" or "reject"

  const leave = leaves.find(l => l.id === leaveId);
  if (!leave) return res.status(404).json({ msg: "Leave not found" });

  // Only allow if advisor has approved
  if (leave.status !== "advisor_approved")
    return res.status(400).json({ msg: "Leave must be approved by advisor first" });

  if (action !== "approve" && action !== "reject")
    return res.status(400).json({ msg: 'Action must be "approve" or "reject"' });

  leave.status = action === "approve" ? "warden_approved" : "rejected";
  leave.wardenId = req.user.id;

  // If approved, generate QR code for security
  if (action === "approve") {
    const qrData = `leaveId:${leave.id}|studentId:${leave.studentId}|status:approved`;
    leave.qrCode = await QRCode.toDataURL(qrData); // generates base64 image
  }

  res.json({ msg: `Leave ${leave.status}`, leave });
};
// Parent confirms student arrival
export const confirmArrival = (req, res) => {
  const leaveId = parseInt(req.params.id);
  const leave = leaves.find(l => l.id === leaveId);

  if (!leave) return res.status(404).json({ msg: "Leave not found" });

  // Only allow confirmation if warden approved
  if (leave.status !== "warden_approved")
    return res.status(400).json({ msg: "Leave must be approved by warden first" });

  leave.arrivalTimestamp = new Date().toISOString();

  res.json({ msg: "Arrival confirmed by parent", leave });
};

