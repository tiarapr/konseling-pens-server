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
  },
});

module.exports = MailQueue;
