const express = require("express");
const router = express.Router();
const africastalking = require("africastalking");

// Initialize Africa's Talking
const africasTalking = africastalking({
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME,
});

const sms = africasTalking.SMS;

// Send SMS Route
router.post("/send", async (req, res) => {
  try {
    const { sellerPhone, message, senderName } = req.body;

    if (!sellerPhone || !message) {
      return res.status(400).json({ error: "Missing sellerPhone or message" });
    }

    const recipient = sellerPhone.startsWith("+") ? sellerPhone : `+254${sellerPhone}`;

    const result = await sms.send({
      to: [recipient],
      message: `📩 Message from ${senderName || "a buyer"} via HerderHub:\n\n${message}`,
      from: "AFRICASTALKING", // ✅ required for sandbox
    });

    console.log("✅ SMS sent:", result);
    res.json({ success: true, result });
  } catch (err) {
    console.error("❌ Error sending SMS:", err);
    res.status(500).json({ error: "Failed to send SMS", details: err.message });
  }
});

module.exports = router;
