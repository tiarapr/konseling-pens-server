require('dotenv').config();
require('./config/redis');
require('./workers/MailWorker');
require('./workers/WhatsappWorker');

console.log('Workers started and listening for jobs...');