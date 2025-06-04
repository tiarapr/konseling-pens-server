const P = require('pino');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal'); // Import qrcode-terminal

const janjiTemuTemplates = require('../notifications/janji-temu/JanjiTemuCreatedWhatsappTemplate');
const generateJanjiTemuUpdatedWhatsAppMessage = require('../notifications/janji-temu/JanjiTemuUpdateWhatsappTemplate');
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

let sock;

async function initializeSocket() {
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '../auth_info'));

  sock = makeWASocket({
    logger: P({ level: 'silent' }),
    auth: state,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        initializeSocket();
      }
    } else if (connection === 'open') {
      console.log('Connection established');
    } else if (qr) {
      // Display QR code in the terminal
      qrcode.generate(qr, { small: true }, (qrcodeString) => {
        console.log(qrcodeString);  // Print the QR code to the terminal
      });
    }
  });
}

initializeSocket();

class WhatsAppService {
  async sendMessage(to, body) {
    try {
      const formatted = to.startsWith('62') ? `${to}@s.whatsapp.net` : `62${to}@s.whatsapp.net`;
      await sock.sendMessage(formatted, { text: body });
      console.log(`Sent WhatsApp message to ${formatted}`);
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw new Error('Failed to send WhatsApp message');
    }
  }

  async sendJanjiTemuNotification(data) {
    const message = janjiTemuTemplates.untukMahasiswa(data);
    return this.sendMessage(data.recipient.phone, message);
  }

  async sendAdminJanjiTemuNotification(data) {
    const message = janjiTemuTemplates.untukAdmin(data);
    return this.sendMessage(data.recipient.phone, message);
  }

  async statusJanjiTemuUpdateNotification(data) {
    const message = generateJanjiTemuUpdatedWhatsAppMessage(data);
    return this.sendMessage(data.recipient.phone, message);
  }
}

module.exports = WhatsAppService;
