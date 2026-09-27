import dotenv from 'dotenv';
dotenv.config();

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;

console.log('VAPI_API_KEY:', VAPI_API_KEY ? 'SET' : 'NOT SET');
console.log('VAPI_ASSISTANT_ID:', VAPI_ASSISTANT_ID ? 'SET' : 'NOT SET');

// Try with phoneNumberId format - you need to create a phone number in Vapi dashboard first
// For now, let's check what the assistant expects
const response = await fetch(`https://api.vapi.ai/assistant/${process.env.VAPI_ASSISTANT_ID}`, {
  headers: {
    'Authorization': `Bearer ${VAPI_API_KEY}`,
  },
});

const data = await response.json();
console.log('Assistant config:', JSON.stringify(data, null, 2));