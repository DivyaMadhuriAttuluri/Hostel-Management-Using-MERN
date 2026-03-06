import Notification from "../models/Notification.js";

/* ======================================================
   GET MY NOTIFICATIONS
   GET /api/notifications
====================================================== */
export const getMyNotifications = async (req, res) => {
  try {
    if (req.role !== "student") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const notifications = await Notification.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      student: req.user._id,
      isRead: false,
    });

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   MARK ALL AS READ
   PATCH /api/notifications/read-all
====================================================== */
export const markAllRead = async (req, res) => {
  try {
    if (req.role !== "student") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await Notification.updateMany(
      { student: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   MARK ONE AS READ
   PATCH /api/notifications/:id/read
====================================================== */
export const markOneRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, student: req.user._id },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
