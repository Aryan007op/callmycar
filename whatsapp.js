const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    console.log('Scan this QR code with WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('✅ WhatsApp authenticated!');
});

client.on('ready', () => {
    console.log('✅ WhatsApp Client is ready!');
});

client.on('auth_failure', (message) => {
    console.log('❌ Authentication failed:', message);
});

client.initialize();
