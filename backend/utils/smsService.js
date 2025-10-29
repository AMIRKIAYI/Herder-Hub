const africastalking = require("africastalking");

const AT = africastalking({
  apiKey: process.env.AFRICASTALKING_API_KEY,
  username: process.env.AFRICASTALKING_USERNAME,
});

const sms = AT.SMS;

async function sendSMS(to, message) {
  try {
    const response = await sms.send({
      to, // e.g. ['+254700000000']
      message,
      from: process.env.AFRICASTALKING_SENDER_ID || "", // optional
    });
    console.log("✅ SMS sent:", response);
    return response;
  } catch (err) {
    console.error("❌ Error sending SMS:", err);
    throw err;
  }
}

module.exports = sendSMS;
