const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode-terminal/vendor/QRCode');
const QRErrorCorrectLevel = require('qrcode-terminal/vendor/QRCode/QRErrorCorrectLevel');

let isClientReady = false;
let connectionState = 'initializing';
let lastConnectionError = null;
const authDataPath = process.env.WHATSAPP_AUTH_PATH || path.join(__dirname, '.wwebjs_auth');

function saveQrImage(qr) {
  const encodedQr = new QRCode(-1, QRErrorCorrectLevel.L);
  encodedQr.addData(qr);
  encodedQr.make();
  const quietZone = 4;
  const size = encodedQr.getModuleCount() + quietZone * 2;
  const paths = [];
  for (let row = 0; row < encodedQr.getModuleCount(); row += 1) {
    for (let column = 0; column < encodedQr.getModuleCount(); column += 1) {
      if (encodedQr.modules[row][column]) {
        paths.push(`M${column + quietZone} ${row + quietZone}h1v1h-1z`);
      }
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${paths.join('')}" fill="#000"/></svg>`;
  const qrImagePath = path.join(authDataPath, 'active-whatsapp-qr.svg');
  fs.mkdirSync(path.dirname(qrImagePath), { recursive: true });
  fs.writeFileSync(qrImagePath, svg, 'utf8');
}

// Initialize WhatsApp client with LocalAuth for local session persistence
const client = new Client({
  // Use a fresh profile for this pairing session; keep any previous profile intact.
  authStrategy: new LocalAuth({ clientId: 'callmycar-pairing', dataPath: authDataPath }),
  puppeteer: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || (process.platform === 'win32'
      ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
      : undefined),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Event: Log QR code to terminal when needed for scanning
client.on('qr', (qr) => {
  connectionState = 'qr_required';
  lastConnectionError = null;
  try {
    saveQrImage(qr);
    console.log('WhatsApp pairing QR image saved to app/backend/.wwebjs_auth/active-whatsapp-qr.svg');
  } catch (error) {
    console.error('Could not save WhatsApp pairing QR image:', error.message);
  }
  console.log('\n------------------------------------------------------------');
  console.log('WhatsApp Web QR Code received. Scan with your WhatsApp app:');
  qrcode.generate(qr, { small: true });
  console.log('------------------------------------------------------------\n');
});

// Event: Client successfully authenticated
client.on('authenticated', () => {
  connectionState = 'authenticated';
  lastConnectionError = null;
  console.log('WhatsApp client authenticated successfully.');
});

// Event: Client is ready to send messages
client.on('ready', () => {
  isClientReady = true;
  connectionState = 'ready';
  lastConnectionError = null;
  console.log('WhatsApp client is ready to send messages!');
});

// Event: Authentication failure
client.on('auth_failure', (msg) => {
  isClientReady = false;
  connectionState = 'auth_failure';
  lastConnectionError = String(msg || 'WhatsApp authentication failed.');
  console.error('WhatsApp authentication failure:', msg);
});

// Event: Client disconnected
client.on('disconnected', (reason) => {
  isClientReady = false;
  connectionState = 'disconnected';
  lastConnectionError = String(reason || 'WhatsApp disconnected.');
  console.log('WhatsApp client was disconnected:', reason);
});

// Initialize client
client.initialize().catch((error) => {
  isClientReady = false;
  connectionState = 'startup_error';
  lastConnectionError = error.message;
  console.error('WhatsApp Web initialization failed:', error.message);
});

/**
 * Check if the WhatsApp client is authenticated and ready
 * @returns {boolean}
 */
const isReady = () => isClientReady;
const getStatus = () => ({ state: connectionState, error: lastConnectionError });

/**
 * Format Indian phone number into WhatsApp format: 91<number>@c.us
 * Specifically strips out spaces, dashes, and + signs,
 * and formats the number strictly as 91[10-digit-number]@c.us
 * @param {string|number} phone
 * @returns {string}
 */
const formatIndianPhoneNumber = (phone) => {
  if (!phone) return '';
  const rawPhone = String(phone).trim();
  const digits = rawPhone.replace(/\D/g, '');
  // Phone values without a country code are treated as Indian national numbers.
  const internationalNumber = rawPhone.startsWith('+') || digits.length !== 10
    ? digits
    : `91${digits}`;
  return `${internationalNumber}@c.us`;
};

/**
 * Send WhatsApp alert message
 * @param {Object} params
 * @param {string} params.ownerPhone
 * @param {string} params.plateNumber
 * @param {string} params.issue
 * @returns {Promise<any>}
 */
const sendAlert = async ({ ownerPhone, plateNumber, issue }) => {
  // Ensure the ready event has actually fired
  if (!isClientReady) {
    throw new Error('WhatsApp client is not ready. The ready event has not fired yet.');
  }

  const recipient = formatIndianPhoneNumber(ownerPhone);
  const message = `🚨 *CALLMYCAR VEHICLE ALERT* 🚨\n\n` +
    `🚗 *Vehicle:* ${plateNumber}\n` +
    `⚠️ *Issue:* ${issue}\n\n` +
    `Please attend to your vehicle immediately.`;

  return await client.sendMessage(recipient, message);
};

module.exports = {
  client,
  isReady,
  getStatus,
  formatIndianPhoneNumber,
  sendAlert
};
