const { Queue } = require('bullmq');
const redisConfig = require('../config/redis');

const WhatsappQueue = new Queue('{whatsappQueue}', {
  connection: redisConfig,
  prefix: '{whatsappQueue}',
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true, // Bersihkan job sukses
    removeOnFail: 1000,     // Simpan max 1000 job gagal
  },
});

// Monitoring errors
WhatsappQueue.on('error', (error) => {
  console.error('WhatsappQueue error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await WhatsappQueue.close();
  console.log('WhatsappQueue connection closed through app termination');
  process.exit(0);
});

module.exports = WhatsappQueue;
