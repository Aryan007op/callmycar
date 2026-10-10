const path = require('path');
const dotenv = require('dotenv');

// Load environment variables at the very top before other modules or clients
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config(); // Fallback for root CWD

const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3001;
const assistantReportAttempts = new Map();
const vehicleAlertCooldowns = new Map();
const VEHICLE_ALERT_COOLDOWN_MS = 2 * 60 * 1000;

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

// Vehicles created during this server process; Firestore remains the source of truth.
const VEHICLE_DATABASE = {};

// In-memory call session tracking

// Helper to normalize license plates
function normalizePlate(plate) {
  return plate ? plate.toUpperCase().replace(/[^A-Z0-9\s]/g, '').trim() : '';
}

function getVehicleDocumentId(plate) {
  return normalizePlate(plate).replace(/\s+/g, '');
}

function reserveVehicleAlertCooldown(plateOrKey) {
  const key = getVehicleDocumentId(plateOrKey);
  if (!key) return { allowed: true, key: null, token: null };

  const now = Date.now();
  for (const [storedKey, timestamp] of vehicleAlertCooldowns) {
    if (now - timestamp >= VEHICLE_ALERT_COOLDOWN_MS) vehicleAlertCooldowns.delete(storedKey);
  }

  const lastAlertAt = vehicleAlertCooldowns.get(key);
  if (lastAlertAt && now - lastAlertAt < VEHICLE_ALERT_COOLDOWN_MS) {
    return {
      allowed: false,
      key,
      remainingSeconds: Math.ceil((VEHICLE_ALERT_COOLDOWN_MS - (now - lastAlertAt)) / 1000),
    };
  }

  vehicleAlertCooldowns.set(key, now);
  return { allowed: true, key, token: now };
}

function releaseVehicleAlertCooldown(reservation) {
  if (reservation?.key && vehicleAlertCooldowns.get(reservation.key) === reservation.token) {
    vehicleAlertCooldowns.delete(reservation.key);
  }
}

function rejectDuringCooldown(res, reservation) {
  if (reservation.allowed) return false;
  res.set('Retry-After', String(reservation.remainingSeconds));
  res.status(429).json({
    success: false,
    error: `Please wait ${reservation.remainingSeconds} seconds before sending another alert for this vehicle.`,
    retryAfterSeconds: reservation.remainingSeconds,
  });
  return true;
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
  const clean = String(phone).replace(/[^0-9+]/g, '');
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

  const displayName = [color, make, model, year ? `(${year})` : ''].filter(Boolean).join(' ') || 'Registered Vehicle';
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
app.post('/api/lookup', async (req, res) => {
  const { plate = '', state = 'NY' } = req.body;
  const cleanPlate = normalizePlate(plate);

  if (!cleanPlate) {
    return res.status(400).json({ error: 'License plate number is required.' });
  }

  const documentId = getVehicleDocumentId(cleanPlate);
  let vehicle;
  try {
    vehicle = await findVehicleForAssistantReport(documentId);
  } catch (error) {
    console.error('[Vehicle lookup error]', error.message);
    return res.status(503).json({ success: false, error: 'Vehicle lookup is temporarily unavailable.' });
  }
  if (!vehicle) {
    return res.status(404).json({ success: false, error: 'This vehicle is not registered.' });
  }

  const ownerPhone = vehicle.ownerRealPhone || vehicle.ownerPhone || vehicle.phone || '';
  const displayName = vehicle.displayName || [vehicle.color, vehicle.make, vehicle.model, vehicle.year ? `(${vehicle.year})` : ''].filter(Boolean).join(' ') || 'Registered Vehicle';

  res.json({
    success: true,
    vehicle: {
      plate: vehicle.plateDisplay || vehicle.plate || vehicle.plateNumber || cleanPlate,
      state: vehicle.state || state.toUpperCase(),
      displayName,
      registered: true,
      verified: true,
      shieldStatus: vehicle.shieldStatus || '',
      ownerMaskedPhone: vehicle.ownerMaskedPhone || maskPhoneNumber(ownerPhone),
      telegramPaired: Boolean(vehicle.telegramChatId),
    },
  });
});

/**
 * POST /api/call
 * Trigger automated AI Voice Agent call to vehicle owner
 */
app.post('/api/call', async (req, res) => {
  const { plate, issue = 'Driveway Blocked', urgency = 'urgent', ai_mode = 'bot' } = req.body;
  const cleanPlate = normalizePlate(plate);
  if (!cleanPlate) {
    return res.status(400).json({ success: false, error: 'License plate number is required.' });
  }
  let vehicle;
  try {
    vehicle = await findVehicleForAssistantReport(getVehicleDocumentId(cleanPlate));
  } catch (error) {
    console.error('[Call vehicle lookup error]', error.message);
    return res.status(503).json({ success: false, error: 'Vehicle lookup is temporarily unavailable.' });
  }
  if (!vehicle) return res.status(404).json({ success: false, error: 'This vehicle is not registered.' });
  const ownerPhone = vehicle.ownerRealPhone || vehicle.ownerPhone || vehicle.phone || '';
  const displayPlate = vehicle.plateDisplay || vehicle.plate || vehicle.plateNumber || cleanPlate;
  const displayName = vehicle.displayName || `${vehicle.color || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'Registered Vehicle';
  if (!ownerPhone) return res.status(400).json({ success: false, error: 'This vehicle has no owner phone number registered.' });
  if (!process.env.VAPI_API_KEY || !process.env.VAPI_ASSISTANT_ID) {
    return res.status(503).json({ success: false, error: 'Voice calling is not configured.' });
  }

  const cooldownReservation = reserveVehicleAlertCooldown(cleanPlate);
  if (rejectDuringCooldown(res, cooldownReservation)) return;

  const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const startTime = Date.now();

  const session = {
    callId,
    plate: displayPlate,
    vehicleDesc: displayName,
    issue,
    urgency,
    ai_mode,
    startTime,
    status: 'ringing',
    step: 1,
    history: [
      { timestamp: new Date().toISOString(), status: 'Initiating encrypted relay proxy' },
      { timestamp: new Date().toISOString(), status: `Dialing owner of ${displayPlate}` },
    ],
  };

  // Vapi AI voice dispatch
  if (process.env.VAPI_API_KEY && process.env.VAPI_ASSISTANT_ID) {
    try {
      const vapiResponse = await fetch('https://api.vapi.ai/call/phone', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assistantId: process.env.VAPI_ASSISTANT_ID,
            customer: {
              number: ownerPhone,
            },
            assistantOverrides: {
              variableValues: {
                plate: displayPlate,
                vehicleDesc: displayName,
                issue: issue,
              },
            },
          }),
        });
      const vapiData = await vapiResponse.json();
      if (!vapiResponse.ok || !vapiData.id) {
        throw new Error(vapiData.message || vapiData.error || 'Voice provider rejected the call request.');
      }
      session.vapiCallId = vapiData.id;
    } catch (err) {
      releaseVehicleAlertCooldown(cooldownReservation);
      console.error('[Vapi.ai Error]', err.message);
      return res.status(502).json({ success: false, error: err.message || 'Voice call failed to start.' });
    }
  }

  res.json({
    success: true,
    callId: session.vapiCallId,
    status: 'ringing',
    message: `AI Voice Assistant is dialing the registered driver of ${displayPlate}.`,
    session,
  });
});

/**
 * GET /api/status/:callId
 * Poll live status of ongoing AI Voice Call
 */
app.get('/api/status/:callId', async (req, res) => {
  const { callId } = req.params;
  if (!process.env.VAPI_API_KEY) {
    return res.status(503).json({ success: false, error: 'Voice call status is not configured.' });
  }

  try {
    const response = await fetch(`https://api.vapi.ai/call/${encodeURIComponent(callId)}`, {
      headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` },
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data.message || data.error || 'Could not retrieve call status.' });
    }

    const status = data.status || 'unknown';
    const completed = ['ended', 'completed', 'failed'].includes(status.toLowerCase());
    return res.json({
      success: true,
      callId,
      status,
      step: completed ? 4 : status.toLowerCase() === 'in-progress' ? 2 : 1,
      message: `Voice provider status: ${status}`,
    });
  } catch (error) {
    console.error('[Voice status error]', error.message);
    return res.status(502).json({ success: false, error: 'Could not retrieve live call status.' });
  }
});
/**
 * POST /api/sms
 * Send a WhatsApp alert through the authenticated WhatsApp Web session
 */
app.post('/api/sms', async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Empty request body received by server' });
  }

  let cooldownReservation;
  let deliveredCount = 0;
  try {
    const body = req.body || {};
    const plateNumber = body.plateNumber || body.licensePlate || '';
    const customMessage = body.customMessage || body.message || 'Please move your vehicle!';
    
    const cleanPlate = getVehicleDocumentId(plateNumber);
    const vehicle = !body.phone && cleanPlate
      ? await findVehicleForAssistantReport(getVehicleDocumentId(cleanPlate))
      : null;
    let targetPhone = body.phone || vehicle?.ownerRealPhone || vehicle?.ownerPhone || vehicle?.phone || '';
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

    const additionalPhones = Array.isArray(body.additionalPhones) ? body.additionalPhones : [];
    const recipients = [targetPhone, ...additionalPhones.map(normalizePhoneToE164)];
    if (recipients.some((phone) => !phone)) {
      return res.status(400).json({ error: 'An additional alert recipient has an invalid phone number.' });
    }
    cooldownReservation = reserveVehicleAlertCooldown(cleanPlate || targetPhone);
    if (rejectDuringCooldown(res, cooldownReservation)) return;

    const messages = [];
    for (const recipient of [...new Set(recipients)]) {
      const message = await whatsappWeb.sendAlert({ ownerPhone: recipient, plateNumber: cleanPlate || 'ALERT', issue: customMessage });
      messages.push(message);
      deliveredCount += 1;
    }
    console.log('WhatsApp Web message(s) sent:', messages.map((message) => message?.id?._serialized).filter(Boolean));
    return res.status(200).json({
      success: true,
      messageId: messages[0]?.id?._serialized || null,
      recipientCount: messages.length,
      status: 'sent',
    });
  } catch (error) {
    if (deliveredCount === 0) releaseVehicleAlertCooldown(cooldownReservation);
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
  let cooldownReservation;
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
    cooldownReservation = reserveVehicleAlertCooldown(cleanPlate);
    if (rejectDuringCooldown(res, cooldownReservation)) return;
    const result = await sendTelegramMessage(String(chatId), messageText, 'Markdown');
    return res.status(200).json({ success: true, messageId: result.result?.message_id });
  } catch (error) {
    releaseVehicleAlertCooldown(cooldownReservation);
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
  let cooldownReservation;

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

    cooldownReservation = reserveVehicleAlertCooldown(cleanPlate);
    if (rejectDuringCooldown(res, cooldownReservation)) return;
    const displayPlate = String(vehicle.plateDisplay || vehicle.plate || vehicle.plateNumber || cleanPlate);
    const delivery = await dispatchAssistantReport(vehicle, cleanPlate, issue, urgency);
    return res.status(200).json({
      fulfillmentText: `Got it. A private alert has been sent to the owner of vehicle ${displayPlate} regarding ${issue}.`,
      success: true,
      plate: cleanPlate,
      channel: delivery.channel,
    });
  } catch (error) {
    releaseVehicleAlertCooldown(cooldownReservation);
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
  const whatsappWeb = getWhatsAppWebService();
  let cooldownReservation;

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

    cooldownReservation = reserveVehicleAlertCooldown(plateNumber);
    if (rejectDuringCooldown(res, cooldownReservation)) return;
    const result = await whatsappWeb.sendAlert({ ownerPhone: rawPhone, plateNumber, issue });

    return res.status(200).json({
      success: true,
      message: 'WhatsApp alert sent successfully',
      recipient: maskPhoneNumber(rawPhone),
      messageId: result?.id?._serialized || null
    });
  } catch (error) {
    releaseVehicleAlertCooldown(cooldownReservation);
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
