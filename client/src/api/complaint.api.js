import api from "./axios";

/* ================================
   STUDENT
================================ */

// create complaint
export const createComplaint = (data) => {
  console.log("API: createComplaint called with data:", data);
  return api.post("/complaints", data);
};

// get logged-in student's complaints
export const getMyComplaints = () =>
  api.get("/complaints/my-complaints");

/* ================================
   ADMIN
================================ */

// get all complaints
export const getAllComplaints = () =>
  api.get("/complaints/admin");

// update complaint status (optionally with a resolution note)
export const updateComplaintStatus = (id, status, resolutionNote = "") =>
  api.patch(`/complaints/${id}/status`, { status, resolutionNote });
