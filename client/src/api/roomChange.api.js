import api from "./axios";

// Student: create room change request
export const createRoomChangeRequest = (data) =>
  api.post("/room-change", data);

// Student: get my requests
export const getMyRoomChangeRequests = () => api.get("/room-change/my");

// Admin: get all block requests
export const getBlockRoomChangeRequests = () => api.get("/room-change/admin");

// Admin: approve/reject
export const updateRoomChangeStatus = (id, data) =>
  api.patch(`/room-change/${id}`, data);
