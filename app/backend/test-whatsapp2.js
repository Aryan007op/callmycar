import dotenv from 'dotenv';
dotenv.config();

import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const testPhone = '+918641040560'; // Your verified number
const whatsappTo = `whatsapp:${testPhone}`;
const whatsappFrom = 'whatsapp:+14155238886'; // Twilio WhatsApp Sandbox

// First, let's try to send a template message
// For sandbox, you might need to use a specific template
const response = await client.messages.create({
  contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e', // Twilio's default WhatsApp template
  from: whatsappFrom,
  to: whatsappTo,
  contentVariables: JSON.stringify({
    '1': 'Test message from CallMyCar',
    '2': 'DL 01 AB 1234'
  }),
});

console.log('SID:', response.sid);
console.log('Status:', response.status);
console.log('To:', response.to);
console.log('From:', response.from);