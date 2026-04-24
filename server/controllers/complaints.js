import Complaint from '../models/Complaint.js'
import { notify } from '../lib/notify.js'
import { sendGenericEmail } from '../lib/sendEmail.js'
import User from '../models/User.js'

export const createComplaintByStudent = async (req, res) => {
    try{
        if(req.role !== "student"){
            return res.status(403).json({success : false, message : "Access denied"})
        }

        const {category, description} = req.body;

        if(!category || !description){
            return res.status(400).json({ message: "All fields are required" });
        }

        const complaint = await Complaint.create({
            student : req.user._id,
            hostelBlock : req.user.hostelBlock,
            category : category,
            description : description,
        })

        return res.status(201).json({
            success : true,
            message : "Complaint submitted successfully",
            complaint : complaint,
        })
    }
    catch(error){
        return res.status(500).json({success : false, message : error.message})
    }
}


export const getStudentComplaints = async (req, res) => {
    try{
        if(req.role !== "student"){
            return res.status(403).json({success : false, message : "Access denied"})
        }

        const complaints = await Complaint.find({student : req.user._id})
                            .sort({createdAt : -1})
        
        res.json({ complaints });   
    }
    catch(error){
        return res.status(500).json({success : false, message : error.message})
    }
}

// Getting hostel Block-wise complaints
export const getAllComplaintsForAdmin = async (req, res) => {
    try{
        if(req.role !== "admin"){
            return res.status(403).json({success : false, message : "Access denied"})
        }

        const allComplaints = await Complaint.find({
            hostelBlock : req.user.hostelBlock,
        })
        .populate("student", "fullName roomNO studentID")
        .sort({createdAt : -1});

        res.json({ complaints: allComplaints })
    }
    catch(error){
        return res.status(500).json({success : false, message : error.message})
    }
}

export const acceptComplaintAndSetResolutionDateTime = async (req, res) => {
    try{
        if(req.role !== "admin"){
            return res.status(403).json({success : false, message : "Access denied"})
        }

        const {resolutionDate, resolutionTime} = req.body;

        const complaint = await Complaint.findById(req.params.id)
        if(!complaint){
            return res.status(404).json({success : false, message : "Complaint not found"})
        }

        if(complaint.hostelBlock !== req.user.hostelBlock){
            return res.status(403).json({ message: "Not authorized for this block" });
        }

        complaint.status = "accepted"
        complaint.resolutionDate = resolutionDate
        complaint.resolutionTime = resolutionTime

        await complaint.save()

        return res.json({success : true, message : complaint})
    }
    catch(error){
        return res.status(500).json({success : false, message : error.message})
    }
}

export const resolveComplaint = async (req, res) => {
    try{
        if(req.role !== "admin"){
            return res.status(403).json({success : false, message : "Access denied"})
        }

        const complaint = await Complaint.findById(req.params.id)
        if(!complaint){
            return res.status(404).json({success : false, message : "Complaint not found"})
        }

        if(complaint.hostelBlock !== req.user.hostelBlock){
            return res.status(403).json({ message: "Not authorized for this block" });
        }

        complaint.status = "resolved"
        await complaint.save()

        // 🔔 Notify student
        await notify({
          studentId: complaint.student,
          type: "complaint",
          title: "Complaint Resolved ✅",
          message: `Your ${complaint.category} complaint has been resolved by the hostel admin.`,
          refId: complaint._id,
        });

        return res.json({
            success : true,
            message : complaint
        })

    }
    catch(error){
        return res.status(500).json({success : false, message : error.message})
    }
}

// Send email helper for complaint status changes
const sendComplaintEmail = async (studentId, complaint, status) => {
  try {
    const student = await User.findById(studentId).select('collegeEmail fullName');
    if (student?.collegeEmail) {
      const { sendGenericEmail } = await import('../lib/sendEmail.js');
      await sendGenericEmail({
        to: student.collegeEmail,
        subject: `Complaint ${status === 'resolved' ? 'Resolved ✅' : 'Updated'} — Hostel Management`,
        html: `
          <h2>Complaint ${status === 'resolved' ? 'Resolved' : 'Status Updated'}</h2>
          <p>Hello <b>${student.fullName}</b>,</p>
          <p>Your <b>${complaint.category}</b> complaint has been <b>${status}</b>.</p>
          <p><b>Description:</b> ${complaint.description}</p>
          <br/>
          <p>Regards,<br/>Hostel Administration</p>
        `,
      });
    }
  } catch (err) {
    console.error('Complaint email error:', err.message);
  }
};

// Generic status updater for admin to support frntd
export const updateComplaintStatus = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { status, resolutionNote } = req.body;
    const allowedStatuses = ["pending", "accepted", "resolved"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.hostelBlock !== req.user.hostelBlock) {
      return res.status(403).json({ message: "Not authorized for this block" });
    }

    complaint.status = status;
    if (resolutionNote) complaint.resolutionNote = resolutionNote;
    await complaint.save();

    // 🔔 Notify student when resolved
    if (status === "resolved") {
      const noteMsg = resolutionNote ? ` Note: ${resolutionNote}` : "";
      await notify({
        studentId: complaint.student,
        type: "complaint",
        title: "Complaint Resolved ✅",
        message: `Your ${complaint.category} complaint has been marked as resolved by the admin.${noteMsg}`,
        refId: complaint._id,
      });
    }

    res.json({ success: true, complaint });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};