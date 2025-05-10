require('dotenv').config();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

client.messages
  .create({
    from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
    to: 'whatsapp:+917975396134', // replace with your WhatsApp number
    body: '✅ Test WhatsApp message from Student Todo App!'
  })
  .then(msg => console.log('✅ Message sent:', msg.sid))
  .catch(err => console.error('❌ Failed to send message:', err.message));
