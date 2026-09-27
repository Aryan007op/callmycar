// import fetch from 'node-fetch';  // Use native fetch (Node 18+)
import dotenv from 'dotenv';
dotenv.config();

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;

console.log('VAPI_API_KEY:', VAPI_API_KEY ? 'SET' : 'NOT SET');
console.log('VAPI_ASSISTANT_ID:', VAPI_ASSISTANT_ID ? 'SET' : 'NOT SET');
console.log('Key prefix:', VAPI_API_KEY?.slice(0, 10));

const testPhone = '+919876543210'; // REPLACE WITH YOUR ACTUAL NUMBER

const response = await fetch('https://api.vapi.ai/call/phone', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${VAPI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    assistantId: VAPI_ASSISTANT_ID,
    customer: {
      number: testPhone,
    },
    assistantOverrides: {
      variableValues: {
        plate: 'TEST 1234',
        vehicleDesc: 'Test Car',
        issue: 'Driveway Blocked',
      },
    },
  }),
});

const data = await response.json();
console.log('Status:', response.status);
console.log('Response:', JSON.stringify(data, null, 2));