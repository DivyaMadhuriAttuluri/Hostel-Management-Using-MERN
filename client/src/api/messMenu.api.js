import api from "./axios";

// Get mess menu for a block
export const getMessMenu = (hostelBlock) =>
  api.get(`/mess-menu?hostelBlock=${hostelBlock}`);

// Admin: create/update menu entry
export const upsertMessMenu = (data) => api.post("/mess-menu", data);

// Admin: delete menu entry
export const deleteMessMenuEntry = (id) => api.delete(`/mess-menu/${id}`);
