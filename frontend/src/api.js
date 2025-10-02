// frontend/src/api.js
const API_URL = "http://localhost:5000";

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.msg || 'Something went wrong');
  }
  return data;
};

export const signup = async (userData) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
};

export const login = async (credentials) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return handleResponse(res);
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
  return handleResponse(res);
};

export const getLeaves = async (token) => {
  const res = await fetch(`${API_URL}/leave/my`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
  });
  return handleResponse(res);
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
  return handleResponse(res);
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
  return handleResponse(res);
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
  return handleResponse(res);
};

export const wardenEmergencyApprove = async (token, leaveId, action, comments, meetingDate) => {
  const res = await fetch(`${API_URL}/leave/${leaveId}/emergency-approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ action, comments, meetingDate }),
  });
  return handleResponse(res);
};

export const confirmArrival = async (token, leaveId) => {
  const res = await fetch(`${API_URL}/leave/${leaveId}/arrival`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(res);
};

export const getQRCode = async (token, leaveId) => {
  const res = await fetch(`${API_URL}/leave/${leaveId}/qrcode`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(res);
};

// FIXED: uploadProof function - using API_URL and correct endpoint
export const uploadProof = async (token, leaveId, formData) => {
  try {
    const response = await fetch(`${API_URL}/leave/${leaveId}/upload-proof`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // NOTE: Don't set Content-Type for FormData - browser will set it automatically with boundary
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Upload proof error:', error);
    throw error;
  }
};

export const verifyProof = async (token, leaveId, verificationData) => {
  const res = await fetch(`${API_URL}/leave/${leaveId}/verify-proof`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(verificationData),
  });
  return handleResponse(res);
};

export const getStudentsSummary = async (token) => {
  const res = await fetch(`${API_URL}/leave/advisor/students-summary`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
  });
  return handleResponse(res);
};