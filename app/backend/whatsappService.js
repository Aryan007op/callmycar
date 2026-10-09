const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let isClientReady = false;

// Initialize WhatsApp client with LocalAuth for local session persistence
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Event: Log QR code to terminal when needed for scanning
client.on('qr', (qr) => {
  console.log('\n------------------------------------------------------------');
  console.log('WhatsApp Web QR Code received. Scan with your WhatsApp app:');
  qrcode.generate(qr, { small: true });
  console.log('------------------------------------------------------------\n');
});

// Event: Client successfully authenticated
client.on('authenticated', () => {
  console.log('WhatsApp client authenticated successfully.');
});

// Event: Client is ready to send messages
client.on('ready', () => {
  isClientReady = true;
  console.log('WhatsApp client is ready to send messages!');
});

// Event: Authentication failure
client.on('auth_failure', (msg) => {
  isClientReady = false;
  console.error('WhatsApp authentication failure:', msg);
});

// Event: Client disconnected
client.on('disconnected', (reason) => {
  isClientReady = false;
  console.log('WhatsApp client was disconnected:', reason);
});

// Initialize client
client.initialize();

/**
 * Check if the WhatsApp client is authenticated and ready
 * @returns {boolean}
 */
const isReady = () => isClientReady;

/**
 * Format Indian phone number into WhatsApp format: 91<number>@c.us
 * Specifically strips out spaces, dashes, and + signs,
 * and formats the number strictly as 91[10-digit-number]@c.us
 * @param {string|number} phone
 * @returns {string}
 */
const formatIndianPhoneNumber = (phone) => {
  if (!phone) return '';
  // Specifically strip out spaces, dashes, and + signs, and any non-digits
  const cleanNumber = String(phone).replace(/[\s\-+]/g, '').replace(/\D/g, '');
  // Format strictly as 91[10-digit-number]@c.us
  const tenDigitNumber = cleanNumber.slice(-10);
  return `91${tenDigitNumber}@c.us`;
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
  formatIndianPhoneNumber,
  sendAlert
};
