import Invoice from '../models/Invoice.js'
import User from '../models/User.js'
import { notify } from '../lib/notify.js'

export const getMyInvoices = async (req, res) => {
    try{
        if(req.role !== "student"){
            return res.status(403).json({success : false, message : "No access"})
        }

        const studentId = req.user._id

        const invoices = await Invoice.find({
            $or : [
                {student : studentId},
                {
                    isBroadcast : true,
                    hostelBlock : req.user.hostelBlock
                }
            ]
        }).sort({createdAt : -1})

        res.json({ invoices })
    }
    catch(error){
        return res.status(500).json({success : false, message : error.message})
    }
}

export const getBlockInvoices = async (req, res) => {
    try{
        if(req.role !== "admin"){
            return res.status(403).json({success : false, message : "No access"})
        }

        const invoices = await Invoice.find({
            hostelBlock : req.user.hostelBlock
        })
        .populate("student", "studentID fullName roomNO")
        .sort({createdAt : -1})

        res.json({ invoices })
    }
    catch(error){
        return res.status(500).json({success : false, message : error.message})
    }
}

export const createInvoice = async (req, res) => {
    try{
        if(req.role !== "admin"){
            return res.status(403).json({success : false, message : "No access"})
        }

        const {
            studentID, // Optional: used if isBroadcast is false
            title,
            description,
            amount,
            dueDate,
            isBroadcast
        } = req.body;

        if(!title || !description || !amount || !dueDate){
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 1. BROADCAST: Create individual invoice for EVERY student in the block
        if(isBroadcast){
            // Find all active students in this block
            const students = await User.find({
                role: "student",
                hostelBlock: req.user.hostelBlock,
                isApproved: true // Optional: only invoice approved students
            });

            if(!students || students.length === 0){
                return res.status(404).json({ message: "No students found in this block" });
            }

            // Prepare invoice objects
            const invoicesToCreate = students.map(student => ({
                invoiceID: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Ensure uniqueness
                student: student._id,
                hostelBlock: req.user.hostelBlock,
                title,
                description,
                amount,
                dueDate,
                status: "pending",
                isBroadcast: false // Set false so they act as individual invoices (prevents data leak in getMyInvoices)
            }));

            await Invoice.insertMany(invoicesToCreate);

            // 🔔 Notify every student
            await Promise.all(
              students.map((student) =>
                notify({
                  studentId: student._id,
                  type: "invoice",
                  title: `New Invoice: ${title} 💸`,
                  message: `A new invoice of ₹${amount} for "${title}" has been generated. Due date: ${new Date(dueDate).toLocaleDateString()}.`,
                })
              )
            );

            return res.status(201).json({
                success : true,
                message : `Invoice broadcasted to ${students.length} students`
            })
        }

        // 2. TARGETED: Create invoice for a single specific student
        if (!studentID) {
            return res.status(400).json({ message: "Student ID is required for non-broadcast invoices" });
        }

        const student = await User.findOne({
            _id: studentID, // Assuming frontend sends _id, or change to studentID if needed. Plan implies selecting from list which usually has _id
            hostelBlock: req.user.hostelBlock
        }) || await User.findOne({
             studentID: studentID,
             hostelBlock: req.user.hostelBlock
        });

        if(!student){
            return res.status(404).json({success : false, message : "Student not found in this block"})
        }

        const invoice = await Invoice.create({
            invoiceID : `INV-${Date.now()}`,
            student : student._id,
            hostelBlock : req.user.hostelBlock,
            title,
            description,
            amount,
            dueDate : dueDate,
            status : "pending",
            isBroadcast : false
        })

        res.status(201).json({
            success: true,
            message: "Invoice created for student",
            invoice,
        });

        // 🔔 Notify the student
        await notify({
          studentId: student._id,
          type: "invoice",
          title: `New Invoice: ${title} 💸`,
          message: `A new invoice of ₹${amount} for "${title}" has been generated. Due date: ${new Date(dueDate).toLocaleDateString()}.`,
          refId: invoice._id,
        });
    }
    catch(error){
        console.error("Create Invoice Error:", error);
        return res.status(500).json({success : false, message : error.message})
    }
}

export const markInvoicePaid = async (req, res) => {
    try{
        if(req.role !== "admin"){
            return res.status(403).json({success : false, message : "No access"})
        }

        const invoice = await Invoice.findById(req.params.id)
        if(!invoice){
            return res.status(404).json({ message: "Invoice not found" });
        }

        if(invoice.hostelBlock !== req.user.hostelBlock){
            return res.status(403).json({
                message: "Not authorized for this hostel block",
            });
        }

        if(invoice.status === 'paid'){
            return res.status(400).json({ message: "Invoice already paid" });
        }

        invoice.status = 'paid'
        await invoice.save()

        res.json({
            success : true,
            message : "Invoice marked as paid",
            invoice
        })
    }
    catch(error){
        return res.status(500).json({success : false, message : error.message})
    }
}