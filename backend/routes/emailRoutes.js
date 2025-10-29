const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const mjml = require("mjml");
const africastalking = require("africastalking");

// --- Initialize Africa’s Talking ---
const africastalkingClient = africastalking({
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME,
});
const sms = africastalkingClient.SMS;

// --- Nodemailer Setup ---
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- Route ---
router.post("/send", async (req, res) => {
  const {
    sellerEmail,
    sellerPhone, // 📱 Add seller's phone number in request body
    buyerName,
    subject,
    message,
    senderEmail,
    livestockDetails,
  } = req.body;

  if (!sellerEmail || !subject || !message) {
    return res
      .status(400)
      .json({ error: "Seller email, subject, and message are required." });
  }

  try {
    // --- Load MJML Template ---
    const mjmlTemplatePath = path.join(__dirname, "../templates/inquiryEmail.mjml");
    const mjmlTemplate = fs.readFileSync(mjmlTemplatePath, "utf8");

    // --- Compile Handlebars ---
    const template = handlebars.compile(mjmlTemplate);

    // --- Inject Dynamic Data ---
    const mjmlWithValues = template({
      senderName: buyerName || "Anonymous User",
      senderEmail: senderEmail || "No email provided",
      message: message || "",
      livestock: {
        animalType: livestockDetails?.animalType || "N/A",
        breed: livestockDetails?.breed || "N/A",
        price: livestockDetails?.price
          ? `KES ${livestockDetails.price}`
          : "N/A",
        location: livestockDetails?.location || "N/A",
      },
    });

    // --- Convert MJML → HTML ---
    const { html } = mjml(mjmlWithValues);

    // --- Send Email ---
    const mailOptions = {
      from: `"${buyerName || "HerderHub User"}" <${process.env.EMAIL_USER}>`,
      to: sellerEmail,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully.");

    // --- Send SMS (if sellerPhone is provided) ---
    if (sellerPhone) {
      const smsMessage = `Hi! You’ve received a new inquiry from ${buyerName || "a buyer"} on HerderHub regarding your livestock listing.`;

      await sms.send({
        to: [sellerPhone.startsWith("+") ? sellerPhone : `+${sellerPhone}`],
        message: smsMessage,
        from: "HerderHub", // optional sender ID (works if approved)
      });

      console.log("📱 SMS sent successfully to:", sellerPhone);
    }

    res
      .status(200)
      .json({ success: true, message: "Email and SMS sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending email/SMS:", error);
    res.status(500).json({ error: "Failed to send email or SMS." });
  }
});

module.exports = router;
