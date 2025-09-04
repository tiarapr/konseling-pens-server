const { Queue } = require('bullmq');
const redisConfig = require('../config/redis');

const MailQueue = new Queue('{mailQueue}', {
  connection: redisConfig,
  prefix: '{mailQueue}',
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
MailQueue.on('error', (error) => {
  console.error('MailQueue error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await MailQueue.close();
  console.log('MailQueue connection closed through app termination');
  process.exit(0);
});

module.exports = MailQueue;
