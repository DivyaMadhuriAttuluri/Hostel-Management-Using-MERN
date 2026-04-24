import nodemailer from "nodemailer";

// Initialize Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

export const sendRegistrationStatusEmail = async ({
  to,
  fullName,
  hostelBlock,
  roomNO,
  status, // "approved" | "rejected"
  rejectionReason,
}) => {
  try {
    let subject = "";
    let html = "";

    if (status === "approved") {
      subject = "Hostel Registration Approved ✅";
      html = `
            <h2>Hostel Registration Approved</h2>
            <p>Hello <b>${fullName}</b>,</p>
            <p>Your hostel registration request has been <b>approved</b>.</p>
            <p><b>Hostel Block:</b> ${hostelBlock}</p>
            <p><b>Room Number:</b> ${roomNO}</p>
            <p>You can now log in to the Hostel Management Portal.</p>
            <br/>
            <p>Regards,<br/>Hostel Administration</p>
        `;
    }

    if (status === "rejected") {
      subject = "Hostel Registration Rejected ❌";
      html = `
            <h2>Hostel Registration Rejected</h2>
            <p>Hello <b>${fullName}</b>,</p>
            <p>Your hostel registration request has been <b>rejected</b>.</p>
            <p><b>Reason:</b> ${rejectionReason || "Please contact hostel admin."}</p>
            <br/>
            <p>Regards,<br/>Hostel Administration</p>
        `;
    }

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to} (Status: ${status})`);
  } catch (error) {
    console.error("Nodemailer Email Error:", error.message);
  }
};

/**
 * Generic email sender for any purpose
 */
export const sendGenericEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to} (${subject})`);
  } catch (error) {
    console.error("Nodemailer Email Error:", error.message);
  }
};
