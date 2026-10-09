const path = require('path');
const dotenv = require('dotenv');

// Load environment variables at the very top before other modules or clients
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config(); // Fallback for root CWD

const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3001;
const assistantReportAttempts = new Map();

let whatsappWebService = null;
if (!process.env.VERCEL) {
  try {
    whatsappWebService = require('./whatsappService');
  } catch (error) {
    console.error('WhatsApp Web service could not start:', error.message);
  }
}

function getWhatsAppWebService() {
  return whatsappWebService;
}

// Initialize Twilio client safely after dotenv has loaded
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (err) {
    console.warn('Twilio initialization warning:', err.message);
  }
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.status(200).json({ success: true }));

app.get('/api/whatsapp-status', (_req, res) => {
  const whatsappWeb = getWhatsAppWebService();
  if (!whatsappWeb) {
    return res.status(503).json({
      success: false,
      ready: false,
      error: 'WhatsApp Web needs a persistent backend; Vercel serverless cannot keep its authenticated session.',
    });
  }
  const status = whatsappWeb.getStatus?.() || { state: whatsappWeb.isReady() ? 'ready' : 'initializing' };
  return res.json({ success: true, ready: whatsappWeb.isReady(), ...status });
});

// In-memory registered vehicles database (Mock VAHAN database)
const VEHICLE_DATABASE = {
  'AA 1234': {
    plate: 'AA 1234',
    state: 'NY',
    make: 'Honda',
    model: 'Civic Sedan',
    year: '2022',
    color: 'Sapphire Blue',
    displayName: 'Sapphire Blue Sedan (2022)',
    registered: true,
    verified: true,
    responseEstimate: '~42 Seconds',
    shieldStatus: 'Active Member Shield',
    ownerMaskedPhone: '+1 (•••) •••-4291',
    ownerRealPhone: '+15550194291',
    notifyCall: true,
    notifySms: true,
  },
  '782 WXY': {
    plate: '782 WXY',
    state: 'CA',
    make: 'Tesla',
    model: 'Model 3',
    year: '2023',
    color: 'Pearl White',
    displayName: 'Pearl White Sedan (2023)',
    registered: true,
    verified: true,
    responseEstimate: '~35 Seconds',
    shieldStatus: 'Active Member Shield',
    ownerMaskedPhone: '+1 (•••) •••-8812',
    ownerRealPhone: '+15550198812',
    notifyCall: true,
    notifySms: true,
  },
  '4XYZ 890': {
    plate: '4XYZ 890',
    state: 'WA',
    make: 'Toyota',
    model: 'RAV4',
    year: '2021',
    color: 'Midnight Black',
    displayName: 'Midnight Black SUV (2021)',
    registered: true,
    verified: true,
    responseEstimate: '~50 Seconds',
    shieldStatus: 'Active Member Shield',
    ownerMaskedPhone: '+1 (•••) •••-3049',
    ownerRealPhone: '+15550193049',
    notifyCall: true,
    notifySms: true,
  },
  'DL 01 AB 1234': {
    plate: 'DL 01 AB 1234',
    state: 'DL',
    make: 'Honda',
    model: 'City',
    year: '2021',
    color: 'Modern Steel',
    displayName: 'Modern Steel Sedan (2021)',
    registered: true,
    verified: true,
    responseEstimate: '~40 Seconds',
    shieldStatus: 'Active Member Shield',
    ownerMaskedPhone: '+91 98•••• 1234',
    ownerRealPhone: '+919800001234',
    notifyCall: true,
    notifySms: true,
  },
};

// In-memory call session tracking
const activeCalls = new Map();

// Helper to normalize license plates
function normalizePlate(plate) {
  return plate ? plate.toUpperCase().replace(/[^A-Z0-9\s]/g, '').trim() : '';
}

function getVehicleDocumentId(plate) {
  return normalizePlate(plate).replace(/\s+/g, '');
}

function normalizePhoneToE164(phone) {
  const rawPhone = String(phone || '').trim();
  const isInternationalInput = rawPhone.startsWith('+') || rawPhone.startsWith('00');
  let digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (!isInternationalInput) {
    if (digits.length === 10) digits = `91${digits}`;
    else if (digits.length === 11 && digits.startsWith('1')) digits = digits;
    else if (digits.length === 12 && digits.startsWith('91')) digits = digits;
    else return null;
  }
  return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
}

function getFirestore() {
  if (!admin.apps.length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const credential = serviceAccountJson
      ? admin.credential.cert(JSON.parse(serviceAccountJson))
      : admin.credential.applicationDefault();
    admin.initializeApp({
      credential,
      projectId: process.env.FIREBASE_PROJECT_ID || 'callmycar-c3e30',
    });
  }
  return admin.firestore();
}

async function sendTelegramMessage(chatId, text, parseMode) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token === 'YOUR_BOT_TOKEN_HERE') {
    throw new Error('Telegram Bot Token is not configured on the server.');
  }
  const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...(parseMode ? { parse_mode: parseMode } : {}),
    }),
  });
  const data = await telegramRes.json();
  if (!telegramRes.ok || !data.ok) {
    throw new Error(data.description || 'Failed to send Telegram message');
  }
  return data;
}

function getAssistantValue(payload, keys) {
  const sources = [
    payload?.queryResult?.parameters,
    payload?.result?.parameters,
    payload?.parameters,
    payload,
  ];

  for (const key of keys) {
    for (const source of sources) {
      let value = source?.[key];
      if (Array.isArray(value)) value = value[0];
      if (value && typeof value === 'object') {
        value = value.resolved ?? value.original ?? value.value;
      }
      if (typeof value === 'string' || typeof value === 'number') {
        const normalized = String(value).trim();
        if (normalized) return normalized;
      }
    }
  }
  return '';
}

async function dispatchAssistantReport(vehicle, cleanPlate, issue, urgency) {
  const displayPlate = String(vehicle.plateDisplay || vehicle.plate || vehicle.plateNumber || cleanPlate);
  const ownerPhone = vehicle.ownerRealPhone || vehicle.ownerPhone || vehicle.phone ||
    vehicle.phoneNumber || vehicle.mobileNumber || vehicle.mobile || '';
  const whatsappWeb = getWhatsAppWebService();
  if (!ownerPhone) {
    throw new Error('This vehicle has no owner phone number registered.');
  }
  if (!whatsappWeb) {
    throw new Error('WhatsApp is unavailable on this backend. Run the persistent WhatsApp backend and pair it using its QR code.');
  }
  if (!whatsappWeb.isReady()) {
    const status = whatsappWeb.getStatus?.();
    throw new Error(status?.state === 'qr_required'
      ? 'WhatsApp is not paired. Scan the QR code in the backend terminal, then try again.'
      : `WhatsApp is not ready${status?.state ? ` (${status.state})` : ''}.`);
  }
  const result = await whatsappWeb.sendAlert({
    ownerPhone,
    plateNumber: displayPlate,
    issue: `${issue} (urgency: ${urgency})`,
  });
  return { channel: 'whatsapp', messageId: result?.id?._serialized || null };
}

async function findVehicleForAssistantReport(cleanPlate) {
  // The current registration flow stores new records in memory. Check it first,
  // matching by normalized document ID so spaced and unspaced plates both work.
  const localMatch = Object.values(VEHICLE_DATABASE).find(
    (vehicle) => getVehicleDocumentId(vehicle.plate || vehicle.plateNumber) === cleanPlate,
  );
  if (localMatch) return localMatch;

  // Also support vehicles registered directly in Firestore with clean plate IDs.
  const snapshot = await getFirestore().collection('vehicles').doc(cleanPlate).get();
  return snapshot.exists ? snapshot.data() || {} : null;
}

// Helper to mask phone numbers for zero-knowledge privacy
function maskPhoneNumber(phone) {
  if (!phone) return '+1 (•••) •••-••••';
  const clean = phone.replace(/[^0-9+]/g, '');
  if (clean.length < 4) return '••-••••';
  const lastFour = clean.slice(-4);
  return `+•• (•••) •••-${lastFour}`;
}

/**
 * POST /api/register
 * Register a new vehicle and link owner contact details securely
 */
app.post('/api/register', (req, res) => {
  const {
    plate = '',
    state = 'NY',
    make = 'Generic',
    model = 'Vehicle',
    year = '2024',
    color = 'Silver',
    ownerPhone = '',
    emergencyContact = '',
    ownerName = 'Civic Member',
    telegramChatId = '',
    notifyCall = true,
    notifySms = true,
  } = req.body;

  const cleanPlate = normalizePlate(plate);
  if (!cleanPlate) {
    return res.status(400).json({ error: 'License plate number is required.' });
  }

  const displayName = `${color} ${make} ${model} (${year})`;
  const maskedPhone = maskPhoneNumber(ownerPhone);

  const vehicleRecord = {
    plate: cleanPlate,
    state: state.toUpperCase(),
    make,
    model,
    year,
    color,
    displayName,
    registered: true,
    verified: true,
    responseEstimate: '~30-45 Seconds',
    shieldStatus: 'Active Member Shield',
    ownerMaskedPhone: maskedPhone,
    ownerRealPhone: ownerPhone,
    emergencyContact,
    ownerName,
    telegramChatId: telegramChatId ? telegramChatId.toString().trim() : '',
    notifyCall,
    notifySms,
    registeredAt: new Date().toISOString(),
  };

  VEHICLE_DATABASE[cleanPlate] = vehicleRecord;

  console.log(`[Registration] Vehicle registered successfully: ${cleanPlate} (${displayName})`);

  res.json({
    success: true,
    message: `Vehicle ${cleanPlate} registered successfully! SafeNeighborhood Shield activated.`,
    vehicle: {
      plate: cleanPlate,
      state: vehicleRecord.state,
      displayName: vehicleRecord.displayName,
      shieldStatus: vehicleRecord.shieldStatus,
      ownerMaskedPhone: vehicleRecord.ownerMaskedPhone,
      telegramChatId: vehicleRecord.telegramChatId,
      registered: true,
      verified: true,
    },
  });
});

/**
 * POST /api/lookup
 * Query vehicle registration by plate number
 */
app.post('/api/lookup', (req, res) => {
  const { plate = '', state = 'NY' } = req.body;
  const cleanPlate = normalizePlate(plate);

  if (!cleanPlate) {
    return res.status(400).json({ error: 'License plate number is required.' });
  }

  // Check mock DB or generate a default verified civic entry
  let vehicle = VEHICLE_DATABASE[cleanPlate];

  if (!vehicle) {
    vehicle = {
      plate: cleanPlate,
      state: state.toUpperCase(),
      make: 'Verified',
      model: 'Passenger Vehicle',
      year: '2023',
      color: 'Sapphire Blue',
      displayName: `Sapphire Blue Sedan (2023)`,
      registered: true,
      verified: true,
      responseEstimate: '~45 Seconds',
      shieldStatus: 'Active Member Shield',
      ownerMaskedPhone: '+1 (•••) •••-1290',
      ownerRealPhone: '+15550191290',
    };
  }

  res.json({
    success: true,
    vehicle: {
      plate: vehicle.plate,
      state: vehicle.state,
      displayName: vehicle.displayName,
      registered: vehicle.registered,
      verified: vehicle.verified,
      responseEstimate: vehicle.responseEstimate,
      shieldStatus: vehicle.shieldStatus,
      ownerMaskedPhone: vehicle.ownerMaskedPhone,
      ownerRealPhone: vehicle.ownerRealPhone,
      emergencyContact: vehicle.emergencyContact || '',
      telegramChatId: vehicle.telegramChatId || '',
    },
  });
});

/**
 * POST /api/call
 * Trigger automated AI Voice Agent call to vehicle owner
 */
app.post('/api/call', async (req, res) => {
  const { plate, issue = 'Driveway Blocked', urgency = 'urgent', ai_mode = 'bot', phone } = req.body;
  const cleanPlate = normalizePlate(plate);
  const vehicle = VEHICLE_DATABASE[cleanPlate] || {
    plate: cleanPlate || 'AA 1234',
    displayName: 'Registered Vehicle',
    responseEstimate: '~42 Seconds',
    ownerRealPhone: phone || '+15550194291',
  };
  if (phone) {
    vehicle.ownerRealPhone = phone;
  }

  const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const startTime = Date.now();

  const session = {
    callId,
    plate: vehicle.plate,
    vehicleDesc: vehicle.displayName,
    issue,
    urgency,
    ai_mode,
    startTime,
    status: 'ringing',
    step: 1,
    history: [
      { timestamp: new Date().toISOString(), status: 'Initiating encrypted relay proxy' },
      { timestamp: new Date().toISOString(), status: `Dialing owner of ${vehicle.plate}` },
    ],
  };

  activeCalls.set(callId, session);

  // Vapi AI voice dispatch
  if (process.env.VAPI_API_KEY && process.env.VAPI_ASSISTANT_ID) {
    try {
      console.log(`[Vapi.ai] Dispatching real voice agent call for ${vehicle.plate} (Assistant: ${process.env.VAPI_ASSISTANT_ID})`);
      if (vehicle.ownerRealPhone) {
        const vapiResponse = await fetch('https://api.vapi.ai/call/phone', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assistantId: process.env.VAPI_ASSISTANT_ID,
            customer: {
              number: vehicle.ownerRealPhone,
            },
            assistantOverrides: {
              variableValues: {
                plate: vehicle.plate,
                vehicleDesc: vehicle.displayName,
                issue: issue,
              },
            },
          }),
        });
        const vapiData = await vapiResponse.json();
        console.log('[Vapi.ai Response]', vapiData);
        // Store Vapi call ID for status polling
        if (vapiData.id) {
          session.vapiCallId = vapiData.id;
          activeCalls.set(vapiData.id, session);
        }
      }
    } catch (err) {
      console.error('[Vapi.ai Error]', err.message);
    }
  }

  // Bland.ai dispatch fallback
  if (process.env.BLAND_AI_API_KEY && process.env.BLAND_AI_PHONE_NUMBER) {
    try {
      console.log(`[Bland.ai] Dispatching voice agent call for ${vehicle.plate}`);
    } catch (err) {
      console.error('[Bland.ai Error]', err.message);
    }
  }

  // Twilio voice call fallback (for international numbers)
  let callInitiated = session.vapiCallId ? true : false;
  if (!callInitiated && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PROXY_NUMBER) {
    try {
      console.log(`[Twilio] Dispatching voice call for ${vehicle.plate} to ${vehicle.ownerRealPhone}`);
      const twilioCall = await twilioClient.calls.create({
        to: vehicle.ownerRealPhone,
        from: process.env.TWILIO_PROXY_NUMBER,
        twiml: `<Response><Say voice="alice">Hello, this is CallMyCar calling regarding your vehicle ${vehicle.plate}. ${issue}. Please attend to your vehicle when free. Thank you.</Say></Response>`,
      });
      console.log('[Twilio Call Response]', twilioCall.sid);
      session.twilioCallSid = twilioCall.sid;
      session.status = 'ringing';
      activeCalls.set(twilioCall.sid, session);
      callInitiated = true;
    } catch (err) {
      console.error('[Twilio Error]', err.message);
    }
  }

  // Bland.ai dispatch fallback
  if (!callInitiated && process.env.BLAND_AI_API_KEY && process.env.BLAND_AI_PHONE_NUMBER) {
    try {
      console.log(`[Bland.ai] Dispatching voice agent call for ${vehicle.plate}`);
    } catch (err) {
      console.error('[Bland.ai Error]', err.message);
    }
  }

  res.json({
    success: true,
    callId: session.twilioCallSid || session.vapiCallId || callId,
    status: 'ringing',
    message: `AI Voice Assistant is dialing the registered driver of ${vehicle.plate}.`,
    session,
  });
});

/**
 * GET /api/status/:callId
 * Poll live status of ongoing AI Voice Call
 */
app.get('/api/status/:callId', async (req, res) => {
  const { callId } = req.params;
  const session = activeCalls.get(callId);

  // If not found locally, check Vapi
  if (!session && process.env.VAPI_API_KEY) {
    try {
      const vapiRes = await fetch(`https://api.vapi.ai/call/${callId}`, {
        headers: { 'Authorization': `Bearer ${process.env.VAPI_API_KEY}` },
      });
      if (vapiRes.ok) {
        const vapiData = await vapiRes.json();
        return res.json({
          success: true,
          callId,
          status: vapiData.status || 'unknown',
          step: vapiData.status === 'ended' ? 4 : 2,
          message: `Vapi call status: ${vapiData.status}`,
          vapiData,
        });
      }
    } catch (err) {
      console.error('[Vapi status fetch error]', err.message);
    }
  }

  // If not found, check Twilio
  if (!session && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilioCall = await twilioClient.calls(callId).fetch();
      return res.json({
        success: true,
        callId,
        status: twilioCall.status,
        step: twilioCall.status === 'completed' ? 4 : 2,
        message: `Twilio call status: ${twilioCall.status}`,
        twilioData: twilioCall,
      });
    } catch (err) {
      console.error('[Twilio status fetch error]', err.message);
    }
  }

  if (!session) {
    return res.status(404).json({ error: 'Call session not found' });
  }

  const elapsedSeconds = Math.floor((Date.now() - session.startTime) / 1000);

  if (elapsedSeconds < 4) {
    session.status = 'ringing';
    session.step = 1;
    session.message = 'Ringing handset...';
  } else if (elapsedSeconds < 8) {
    session.status = 'answered';
    session.step = 2;
    session.message = 'Handset answered. Scrambling audio tunnel...';
  } else if (elapsedSeconds < 16) {
    session.status = 'speaking';
    session.step = 3;
    session.message = `AI Butler speaking: "Hello, this is CallMyCar regarding your vehicle (${session.issue})..."`;
  } else {
    session.status = 'completed';
    session.step = 4;
    session.message = 'Owner acknowledged notice: "On my way! 2 mins." Call ended.';
  }

  res.json({
    success: true,
    ...session,
    elapsedSeconds,
  });
});

/**
 * POST /api/sms
 * Send a WhatsApp alert through the authenticated WhatsApp Web session
 */
app.post('/api/sms', async (req, res) => {
  console.log("Payload received:", req.body);
  console.log('Incoming /api/sms headers:', req.headers);

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Empty request body received by server' });
  }

  try {
    const body = req.body || {};
    const plateNumber = body.plateNumber || body.licensePlate || '';
    const customMessage = body.customMessage || body.message || 'Please move your vehicle!';
    
    const cleanPlate = plateNumber.replace(/\s+/g, '').toUpperCase();
    const vehicle = cleanPlate ? VEHICLE_DATABASE[cleanPlate] : null;

    let targetPhone = body.phone || (vehicle && vehicle.ownerRealPhone) || process.env.DEFAULT_ALERT_PHONE || '';
    targetPhone = normalizePhoneToE164(targetPhone);
    if (!targetPhone) {
      return res.status(400).json({ error: 'Enter a valid phone number with its country code (or a 10-digit Indian number).' });
    }

    const whatsappWeb = getWhatsAppWebService();
    if (!whatsappWeb) {
      return res.status(503).json({ error: 'WhatsApp Web needs a persistent backend. Vercel serverless cannot keep its authenticated session.' });
    }
    if (!whatsappWeb.isReady()) {
      return res.status(503).json({ error: 'WhatsApp is not authenticated. Scan the QR code shown in the backend terminal, then try again.' });
    }

    const message = await whatsappWeb.sendAlert({ ownerPhone: targetPhone, plateNumber: cleanPlate || 'ALERT', issue: customMessage });
    console.log('WhatsApp Web message sent:', message?.id?._serialized);
    return res.status(200).json({ success: true, messageId: message?.id?._serialized || null, status: 'sent', targetPhone });
  } catch (error) {
    console.error("WhatsApp error:", error);
    return res.status(500).json({ error: error.message || 'Failed to send WhatsApp message' });
  }
});

/** Return the configured bot username for the Telegram connect deep link. */
app.get('/api/telegram-bot', async (_req, res) => {
  try {
    await telegramWebhookReady;
    if (process.env.TELEGRAM_BOT_USERNAME) {
      return res.json({ success: true, username: process.env.TELEGRAM_BOT_USERNAME.replace(/^@/, '') });
    }
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token || token === 'YOUR_BOT_TOKEN_HERE') {
      return res.status(503).json({ success: false, error: 'Telegram bot is not configured.' });
    }
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json();
    if (!response.ok || !data.ok || !data.result?.username) {
      return res.status(503).json({ success: false, error: data.description || 'Could not identify the Telegram bot.' });
    }
    return res.json({ success: true, username: data.result.username });
  } catch (error) {
    console.error('Telegram bot lookup failed:', error.message);
    return res.status(503).json({ success: false, error: 'Could not identify the Telegram bot.' });
  }
});

/** Pair the Telegram account that opened the vehicle-specific /start deep link. */
app.post('/api/telegram-webhook', async (req, res) => {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(503).json({ success: false, error: 'Telegram webhook secret is not configured.' });
  }
  if (req.get('X-Telegram-Bot-Api-Secret-Token') !== webhookSecret) {
    return res.status(401).json({ success: false, error: 'Invalid Telegram webhook secret.' });
  }

  try {
    const message = req.body?.message;
    const text = typeof message?.text === 'string' ? message.text.trim() : '';
    const startMatch = text.match(/^\/start(?:@[A-Za-z0-9_]+)?\s+PLATE_([A-Za-z0-9]+)$/i);
    if (!startMatch || !message?.from?.id || !message?.chat?.id) {
      return res.status(200).json({ success: true, ignored: true });
    }

    const cleanPlate = getVehicleDocumentId(startMatch[1]);
    const vehicleRef = getFirestore().collection('vehicles').doc(cleanPlate);
    const vehicleSnapshot = await vehicleRef.get();
    const replyChatId = message.chat.id;
    if (!vehicleSnapshot.exists) {
      await sendTelegramMessage(replyChatId, 'I could not find a registered vehicle for this link. Please register your vehicle first.');
      return res.status(200).json({ success: true, paired: false });
    }

    await vehicleRef.set({ telegramChatId: String(message.from.id) }, { merge: true });
    const vehicle = vehicleSnapshot.data() || {};
    const displayPlate = vehicle.plateDisplay || vehicle.plate || vehicle.plateNumber || cleanPlate;
    await sendTelegramMessage(
      replyChatId,
      `✅ Vehicle ${displayPlate} successfully linked to this Telegram account! You will now receive instant vehicle alerts here.`
    );
    return res.status(200).json({ success: true, paired: true });
  } catch (error) {
    console.error('Telegram pairing webhook failed:', error.message);
    return res.status(500).json({ success: false, error: 'Could not pair Telegram account.' });
  }
});

/** Send alerts only to the Telegram account stored on the matching Firestore vehicle. */
app.post('/api/telegram-alert', async (req, res) => {
  try {
    const body = req.body || {};
    const plateNumber = body.plateNumber || body.licensePlate || '';
    if (typeof plateNumber !== 'string' || !plateNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Vehicle plate number is required.' });
    }

    const cleanPlate = getVehicleDocumentId(plateNumber);
    const vehicleSnapshot = await getFirestore().collection('vehicles').doc(cleanPlate).get();
    const vehicle = vehicleSnapshot.exists ? vehicleSnapshot.data() : null;
    const chatId = vehicle?.telegramChatId;
    if (!chatId) {
      return res.status(400).json({ success: false, message: 'Owner has not paired Telegram yet.' });
    }

    const customMessage = body.customMessage || body.message || 'Please move your vehicle immediately!';
    const displayPlate = vehicle.plateDisplay || vehicle.plate || vehicle.plateNumber || cleanPlate;
    const messageText = `🚨 *CALLMYCAR VEHICLE ALERT* 🚨\n\n🚗 *Vehicle:* \`${displayPlate}\`\n💬 *Message:* ${customMessage}\n\n⏰ *Time:* ${new Date().toLocaleTimeString()}`;
    const result = await sendTelegramMessage(String(chatId), messageText, 'Markdown');
    return res.status(200).json({ success: true, messageId: result.result?.message_id });
  } catch (error) {
    console.error('Telegram alert failed:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Failed to send Telegram message.' });
  }
});

/** Process a voice assistant report and alert the registered vehicle owner. */
app.post('/api/assistant-report', async (req, res) => {
  // This route is called directly by the public website, so keep abuse limited
  // without requiring a secret that cannot safely be embedded in frontend code.
  const requester = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const recentAttempts = (assistantReportAttempts.get(requester) || []).filter((time) => now - time < 10 * 60 * 1000);
  if (recentAttempts.length >= 5) {
    return res.status(429).json({ fulfillmentText: 'Please wait a few minutes before sending another vehicle report.', success: false });
  }
  recentAttempts.push(now);
  assistantReportAttempts.set(requester, recentAttempts);

  const body = req.body || {};
  const plateInput = getAssistantValue(body, [
    'plateNumber', 'licensePlate', 'plate', 'vehicleNumber', 'registrationNumber', 'registration_number',
  ]);
  const cleanPlate = getVehicleDocumentId(plateInput);

  if (!cleanPlate) {
    return res.status(400).json({
      fulfillmentText: 'Sorry, I could not detect a valid license plate number.',
      success: false,
    });
  }

  const issue = getAssistantValue(body, ['issue', 'problem', 'report', 'reason'])
    .slice(0, 250) || 'a vehicle issue';
  const urgency = getAssistantValue(body, ['urgency', 'priority']).slice(0, 40) || 'standard';

  try {
    const vehicle = await findVehicleForAssistantReport(cleanPlate);
    if (!vehicle) {
      const displayPlate = plateInput.toUpperCase().replace(/[^A-Z0-9\s]/g, '').trim() || cleanPlate;
      return res.status(404).json({
        fulfillmentText: `Vehicle ${displayPlate} is not registered in the CallMyCar directory.`,
        success: false,
        plate: cleanPlate,
      });
    }

    const displayPlate = String(vehicle.plateDisplay || vehicle.plate || vehicle.plateNumber || cleanPlate);
    const delivery = await dispatchAssistantReport(vehicle, cleanPlate, issue, urgency);
    return res.status(200).json({
      fulfillmentText: `Got it. A private alert has been sent to the owner of vehicle ${displayPlate} regarding ${issue}.`,
      success: true,
      plate: cleanPlate,
      channel: delivery.channel,
    });
  } catch (error) {
    console.error('[Assistant report] Could not process voice report:', error.message);
    return res.status(502).json({
      fulfillmentText: 'Sorry, I could not send that vehicle alert right now. Please try again later.',
      success: false,
      plate: cleanPlate,
    });
  }
});

async function configureTelegramWebhook() {
  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_WEBHOOK_URL: url, TELEGRAM_WEBHOOK_SECRET: secret } = process.env;
  if (!token || !url || !secret || token === 'YOUR_BOT_TOKEN_HERE') return;
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, secret_token: secret, allowed_updates: ['message'] }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.description || 'Telegram rejected webhook configuration.');
    console.log('Telegram webhook configured.');
  } catch (error) {
    console.error('Telegram webhook configuration failed:', error.message);
  }
}

const telegramWebhookReady = configureTelegramWebhook();
/**
 * POST /api/send-alert
 * Send vehicle alert via WhatsApp using whatsapp-web.js
 * Expected JSON body: { ownerPhone, plateNumber, issue }
 */
app.post('/api/send-alert', async (req, res) => {
  console.log("Payload received:", req.body);
  const whatsappWeb = getWhatsAppWebService();

  // Check if WhatsApp client has actually fired the ready event
  if (!whatsappWeb?.isReady()) {
    return res.status(503).json({
      success: false,
      error: whatsappWeb
        ? 'WhatsApp is not authenticated. Scan the QR code shown in the backend terminal, then try again.'
        : 'WhatsApp Web needs a persistent backend. Vercel serverless cannot keep its authenticated session.'
    });
  }

  try {
    const body = req.body || {};
    const rawPhone = body.ownerPhone || body.phone;
    const plateNumber = body.plateNumber || body.plate || body.licensePlate;
    const issue = body.issue || body.customMessage || body.message;

    if (!rawPhone || !plateNumber || !issue) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: ownerPhone (or phone), plateNumber, and issue (or customMessage) are required.'
      });
    }

    const recipient = whatsappWeb.formatIndianPhoneNumber(rawPhone);
    const result = await whatsappWeb.sendAlert({ ownerPhone: rawPhone, plateNumber, issue });

    return res.status(200).json({
      success: true,
      message: 'WhatsApp alert sent successfully',
      recipient,
      messageId: result?.id?._serialized || null
    });
  } catch (error) {
    console.error("WhatsApp error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send WhatsApp alert'
    });
  }
});

// Vercel serverless export
module.exports = app;

// Local development server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CallMyCar backend service running on http://localhost:${PORT}`);
  });
}
