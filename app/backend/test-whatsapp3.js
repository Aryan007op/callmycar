import dotenv from 'dotenv';
dotenv.config();

import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const testPhone = '+918641040560'; // Your verified number
const whatsappTo = `whatsapp:${testPhone}`;
const whatsappFrom = 'whatsapp:+14155238886'; // Twilio WhatsApp Sandbox

// First, let's check what happens if we just send a body (no template)
// This might work if the user has joined the sandbox
try {
  const response = await client.messages.create({
    body: 'Test from CallMyCar',
    from: whatsappFrom,
    to: whatsappTo,
  });
  console.log('SID:', response.sid);
  console.log('Status:', response.status);
} catch (err) {
  console.log('Error with body:', err.message);
  
  // Try with a known sandbox template
  // The sandbox typically has a template like HXxxxxxx
  // Let's try to find it from the console
}