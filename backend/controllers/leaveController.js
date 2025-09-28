const leaves = []; // In-memory storage

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
    status: "pending"
  };
  leaves.push(newLeave);
  res.status(201).json({ msg: "Leave applied", leave: newLeave });
};

export const getLeaves = (req, res) => {
  const userLeaves = leaves.filter(l => l.studentId === req.user.id);
  res.json({ leaves: userLeaves });
};
