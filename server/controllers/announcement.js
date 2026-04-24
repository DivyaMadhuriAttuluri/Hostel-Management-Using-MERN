import Announcement from "../models/Announcement.js";

export const createAnnouncement = async (req, res) => {
    try{
        if(req.role !== "admin"){
            return res.status(403).json({ message: "Access denied" });
        }

        const {title, message} = req.body;

        const announcement = await Announcement.create({
            title : title,
            message : message,
            hostelBlock : req.user.hostelBlock,
            createdBy : req.user._id
        })

        return res.status(201).json({
            success : true,
            message: "Announcement created successfully",
            announcement
        })
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
}

export const getMyAnnouncements = async (req, res) => {
    try{
        if(req.role !== "student"){
            return res.status(403).json({ message: "Access denied" });
        }

        const announcements = await Announcement.find({
            hostelBlock : req.user.hostelBlock
        }).sort({createdAt : -1})

        return res.json(announcements)
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
}

export const getBlockAnnouncements = async (req, res) => {
    try{
        if(req.role !== "admin"){
            return res.status(403).json({ message: "Access denied" });
        }

        const announcements = await Announcement.find({
            hostelBlock : req.user.hostelBlock
        }).sort({createdAt : -1})

        return res.json(announcements)
    }
    catch(error){
        return res.status(500).json({ message: error.message });
    }
}