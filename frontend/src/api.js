const API_URL = "http://localhost:5000";

export const signup = async (userData) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return res.json();
};

export const login = async (credentials) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return res.json();
};

export const applyLeave = async (token, leaveData) => {
  const res = await fetch(`${API_URL}/leave/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(leaveData),
  });
  return res.json();
};

export const getLeaves = async (token) => {
  const res = await fetch(`${API_URL}/leave/my`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` },
  });
  return res.json();
};

export const parentApprove = async (token, leaveId, action) => {
  const res = await fetch(`${API_URL}/leave/${leaveId}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ action }),
  });
  return res.json();
};

export const advisorReview = async (token, leaveId, action) => {
  const res = await fetch(`${API_URL}/leave/${leaveId}/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ action }),
  });
  return res.json();
};

export const wardenApprove = async (token, leaveId, action) => {
  const res = await fetch(`${API_URL}/leave/${leaveId}/warden`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ action }),
  });
  return res.json();
};

export const confirmArrival = async (token, leaveId) => {
  const res = await fetch(`${API_URL}/leave/${leaveId}/arrival`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  return res.json();
};
