const { Queue } = require('bullmq');
const redisClient = require('../config/redis');

const WhatsappQueue = new Queue('whatsappQueue', {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

module.exports = WhatsappQueue;
