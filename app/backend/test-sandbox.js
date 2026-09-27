import dotenv from 'dotenv';
dotenv.config();

import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const testPhone = '+918641040560'; // Your verified number
const whatsappTo = `whatsapp:${testPhone}`;
const whatsappFrom = 'whatsapp:+14155238886'; // Twilio WhatsApp Sandbox number
const SANDBOX_TEMPLATE_SID = 'HXb5b62575e6e4ff6129ad7c8efe1f983e';

console.log('Testing WhatsApp with sandbox template...');
console.log('To:', whatsappTo);
console.log('From:', whatsappFrom);
console.log('Template SID:', SANDBOX_TEMPLATE_SID);

try {
  const response = await client.messages.create({
    contentSid: SANDBOX_TEMPLATE_SID,
    from: whatsappFrom,
    to: whatsappTo,
    contentVariables: JSON.stringify({
      '1': 'CallMyCar',
      '2': 'DL 01 AB 1234',
      '3': 'NOW',
      '4': 'Please move your vehicle'
    }),
  });
  console.log('SUCCESS!');
  console.log('SID:', response.sid);
  console.log('Status:', response.status);
} catch (err) {
  console.log('ERROR:', err.message);
  console.log('Code:', err.code);
  console.log('More info:', err.moreInfo);
}