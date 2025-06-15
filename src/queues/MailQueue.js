const { Queue } = require('bullmq');
const redisClient = require('../config/redis');

const MailQueue = new Queue('mailQueue', {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true, // Clean up completed jobs
    removeOnFail: 1000, // Keep failed jobs for analysis (1000 jobs)
  },
});

// Add event listeners for monitoring
MailQueue.on('error', (error) => {
  console.error('MailQueue error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await MailQueue.close();
});

module.exports = MailQueue;