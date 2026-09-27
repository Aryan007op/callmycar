import dotenv from 'dotenv';
dotenv.config();

import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// List all content templates for this account
const templates = await client.content.v1.contents.list({ limit: 20 });
console.log('Available templates:');
templates.forEach(t => {
  console.log(`- ${t.sid}: ${t.friendlyName || t.language || 'unnamed'} (${t.status})`);
});