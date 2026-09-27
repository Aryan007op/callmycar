import dotenv from 'dotenv';
dotenv.config();

import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const testPhone = '+918641040560'; // Your verified number
const whatsappTo = `whatsapp:${testPhone}`;
const whatsappFrom = 'whatsapp:+14155238886'; // Twilio WhatsApp Sandbox number

// Try different known sandbox template SIDs
const templates = [
  'HXb5b62575e6e4ff6129ad7c8efe1f983e', // Common sandbox template
  'HX229f5a04fd0510ce1b071852155d3e75', // Another possible one
];

async function testTemplate(sid) {
  console.log(`\nTesting template: ${sid}`);
  try {
    const response = await client.messages.create({
      contentSid: sid,
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
    return true;
  } catch (err) {
    console.log('ERROR:', err.message, `(Code: ${err.code})`);
    return false;
  }
}

for (const sid of templates) {
  const success = await testTemplate(sid);
  if (success) break;
}