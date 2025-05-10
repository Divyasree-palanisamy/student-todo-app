

const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const sendSMS = async (phone, message) => {
  try {
    const msg = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`, 
      to: `whatsapp:${phone}`,
      body: message
    });
    return msg;
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error.message);
    if (error.code === 63038) {
      console.error('❌ Message limit exceeded for the day');
      throw new Error('Message limit exceeded for the day');
    }
    throw error;
  }
};


const sendWelcomeSMS = async (phone, username) => {
  const welcomeMessage = `
👋 Welcome to Student Todo App, ${username}! 🎉🎉🎉

🎯 Plan your goals.
🧠 Organize your thoughts.
🚀 Achieve more every day!

Let’s begin your journey to success. 💡
`.trim();

  return sendSMS(phone, welcomeMessage);
};

module.exports = { sendSMS, sendWelcomeSMS };


