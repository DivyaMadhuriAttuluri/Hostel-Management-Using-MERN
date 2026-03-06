import Notification from "../models/Notification.js";

/**
 * Create a notification for a student.
 * @param {Object} opts
 * @param {string} opts.studentId   - MongoDB _id of the student
 * @param {"complaint"|"mess_leave"|"booking"|"invoice"} opts.type
 * @param {string} opts.title       - Short heading
 * @param {string} opts.message     - Full detail message
 * @param {string} [opts.refId]     - Optional source document id
 */
export const notify = async ({ studentId, type, title, message, refId }) => {
  try {
    await Notification.create({
      student: studentId,
      type,
      title,
      message,
      ...(refId && { refId }),
    });
  } catch (err) {
    // Notification failure should never crash the main request
    console.error("⚠️ Failed to create notification:", err.message);
  }
};
