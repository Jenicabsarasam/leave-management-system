// ===============================
// ✅ FRONTEND API HELPER MODULE
// ===============================

const API_URL = "http://localhost:5050";

// Utility: Fetch with timeout for reliability
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    throw new Error("⏱️ Request timed out or server unreachable.");
  }
};

// Utility: Handle API responses
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.msg || "⚠️ Something went wrong");
  }
  return data;
};

// Utility: Retry function (useful for flaky network calls)
const retry = async (fn, retries = 2) => {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) return retry(fn, retries - 1);
    throw err;
  }
};

// ===============================
// 👤 AUTHENTICATION APIs
// ===============================

export const signup = async (userData) => {
  const res = await fetchWithTimeout(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
};

export const login = async (credentials) => {
  const res = await fetchWithTimeout(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return handleResponse(res);
};

// ===============================
// 🏫 LEAVE MANAGEMENT APIs
// ===============================

export const applyLeave = async (token, leaveData) => {
  const res = await fetchWithTimeout(`${API_URL}/leave/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(leaveData),
  });
  return handleResponse(res);
};

export const getLeaves = async (token) => {
  const res = await fetchWithTimeout(`${API_URL}/leave/my`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const parentApprove = async (token, leaveId, action) => {
  const res = await fetchWithTimeout(`${API_URL}/leave/${leaveId}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action }),
  });
  return handleResponse(res);
};

export const advisorReview = async (token, leaveId, action) => {
  const res = await fetchWithTimeout(`${API_URL}/leave/${leaveId}/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action }),
  });
  return handleResponse(res);
};

export const wardenApprove = async (token, leaveId, action) => {
  const res = await fetchWithTimeout(`${API_URL}/leave/${leaveId}/warden`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action }),
  });
  return handleResponse(res);
};

export const wardenEmergencyApprove = async (
  token,
  leaveId,
  action,
  comments,
  meetingDate
) => {
  const res = await fetchWithTimeout(`${API_URL}/leave/${leaveId}/emergency-approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action, comments, meetingDate }),
  });
  return handleResponse(res);
};

export const confirmArrival = async (token, leaveId) => {
  const res = await fetchWithTimeout(`${API_URL}/leave/${leaveId}/arrival`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const getQRCode = async (token, leaveId) => {
  const res = await fetchWithTimeout(`${API_URL}/leave/${leaveId}/qrcode`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

// Upload proof file
export const uploadProof = async (token, leaveId, formData) => {
  const res = await fetchWithTimeout(`${API_URL}/leave/${leaveId}/upload-proof`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData, // Let browser handle Content-Type for FormData
  });
  return handleResponse(res);
};

// Verify proof (by admin)
export const verifyProof = async (token, leaveId, verificationData) => {
  const res = await fetchWithTimeout(`${API_URL}/leave/${leaveId}/verify-proof`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(verificationData),
  });
  return handleResponse(res);
};

export const getStudentsSummary = async (token) => {
  const res = await fetchWithTimeout(`${API_URL}/leave/advisor/students-summary`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

// ===============================
// 🧑‍💼 ADMIN DASHBOARD APIs
// ===============================

// 📊 Dashboard stats
export const getAdminStats = async (token) =>
  retry(async () => {
    const res = await fetchWithTimeout(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  });

// 👥 User Management
export const getAllUsers = async (token) => {
  const res = await fetchWithTimeout(`${API_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const createUser = async (token, userData) => {
  const res = await fetchWithTimeout(`${API_URL}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
};

export const updateUser = async (token, userId, userData) => {
  const res = await fetchWithTimeout(`${API_URL}/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
};

export const deleteUser = async (token, userId) => {
  const res = await fetchWithTimeout(`${API_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

// 📋 Leaves Management
export const getAllLeaves = async (token) => {
  const res = await fetchWithTimeout(`${API_URL}/admin/leaves`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

// 🪵 System Logs
export const getSystemLogs = async (token) => {
  const res = await fetchWithTimeout(`${API_URL}/admin/logs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

// 📦 Bulk Import Users (CSV)
export const bulkImportUsers = async (token, formData) => {
  const res = await fetchWithTimeout(`${API_URL}/admin/users/bulk-import`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(res);
};
// -------- Analytics --------
export const getMonthlyAnalytics = async (token) => {
  const res = await fetch(`${API_URL}/admin/analytics/monthly`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const getRoleAnalytics = async (token) => {
  const res = await fetch(`${API_URL}/admin/analytics/roles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const getBranchAnalytics = async (token) => {
  const res = await fetch(`${API_URL}/admin/analytics/branches`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const getHostelAnalytics = async (token) => {
  const res = await fetch(`${API_URL}/admin/analytics/hostels`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const getActivityAnalytics = async (token) => {
  const res = await fetch(`${API_URL}/admin/analytics/activity`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const compareAnalytics = async (token, from, to) => {
  const res = await fetch(`${API_URL}/admin/analytics/compare?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

export const getAnomalies = async (token) => {
  const res = await fetch(`${API_URL}/admin/analytics/anomalies`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};

// -------- Logs --------
export const searchLogs = async (token, { type = "", q = "", limit = 100 }) => {
  const url = new URL(`${API_URL}/admin/logs/search`);
  if (type) url.searchParams.set("type", type);
  if (q) url.searchParams.set("q", q);
  if (limit) url.searchParams.set("limit", String(limit));
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  return handleResponse(res);
};

export const exportLogs = (token) => {
  const a = document.createElement("a");
  a.href = `${API_URL}/admin/logs/export`;
  a.setAttribute("download", "logs.csv");
  a.setAttribute("target", "_blank");
  a.rel = "noreferrer";
  a.click();
};

export const getLogsSummary = async (token) => {
  const res = await fetch(`${API_URL}/admin/logs/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
};
