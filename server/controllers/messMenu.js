import MessMenu from "../models/MessMenu.js";

/* ======================================================
   GET MESS MENU (Public for authenticated users)
   GET /api/mess-menu?hostelBlock=A
====================================================== */
export const getMessMenu = async (req, res) => {
  try {
    const block = req.query.hostelBlock || req.user?.hostelBlock || "A";

    const menu = await MessMenu.find({ hostelBlock: block }).sort({
      _id: 1,
    });

    // Sort by day order
    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const sorted = menu.sort(
      (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
    );

    res.json({ success: true, menu: sorted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   ADMIN: Upsert Mess Menu (create or update)
   POST /api/mess-menu
====================================================== */
export const upsertMessMenu = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { day, breakfast, lunch, snacks, dinner } = req.body;

    if (!day || !breakfast || !lunch || !dinner) {
      return res.status(400).json({ message: "Day, breakfast, lunch, and dinner are required" });
    }

    const menu = await MessMenu.findOneAndUpdate(
      { hostelBlock: req.user.hostelBlock, day },
      {
        hostelBlock: req.user.hostelBlock,
        day,
        breakfast,
        lunch,
        snacks: snacks || "",
        dinner,
        createdBy: req.user._id,
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: `Menu for ${day} saved successfully`,
      menu,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ======================================================
   ADMIN: Delete Mess Menu Entry
   DELETE /api/mess-menu/:id
====================================================== */
export const deleteMessMenu = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const menu = await MessMenu.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({ message: "Menu entry not found" });
    }

    if (menu.hostelBlock !== req.user.hostelBlock) {
      return res.status(403).json({ message: "Not authorized for this block" });
    }

    await MessMenu.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Menu entry deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
