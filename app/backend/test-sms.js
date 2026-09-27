import dotenv from 'dotenv';
dotenv.config();

import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const testPhone = '+918641040560'; // Your verified number

const response = await client.messages.create({
  body: '[CallMyCar] Test SMS - Vehicle: DL 01 AB 1234',
  from: process.env.TWILIO_PROXY_NUMBER,
  to: testPhone,
});

console.log('SID:', response.sid);
console.log('Status:', response.status);
console.log('To:', response.to);
console.log('From:', response.from);