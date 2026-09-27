import dotenv from 'dotenv';
dotenv.config();

import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const testPhone = '+918641040560'; // Your verified number
const whatsappTo = `whatsapp:${testPhone}`;
const whatsappFrom = 'whatsapp:+14155238886'; // Twilio WhatsApp Sandbox

const response = await client.messages.create({
  body: '[CallMyCar Alert]: Test WhatsApp message (DL 01 AB 1234)',
  from: whatsappFrom,
  to: whatsappTo,
});

console.log('SID:', response.sid);
console.log('Status:', response.status);
console.log('To:', response.to);
console.log('From:', response.from);