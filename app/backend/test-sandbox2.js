import dotenv from 'dotenv';
dotenv.config();

import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const testPhone = '+918641040560'; // Your verified number
const whatsappTo = `whatsapp:${testPhone}`;
const whatsappFrom = 'whatsapp:+14155238886'; // Twilio WhatsApp Sandbox number

console.log('Testing WhatsApp with body (free-form)...');
console.log('To:', whatsappTo);
console.log('From:', whatsappFrom);

try {
  const response = await client.messages.create({
    body: 'Test from CallMyCar: Please move your vehicle (DL 01 AB 1234)',
    from: whatsappFrom,
    to: whatsappTo,
  });
  console.log('SUCCESS!');
  console.log('SID:', response.sid);
  console.log('Status:', response.status);
} catch (err) {
  console.log('ERROR:', err.message);
  console.log('Code:', err.code);
  console.log('More info:', err.moreInfo);
}