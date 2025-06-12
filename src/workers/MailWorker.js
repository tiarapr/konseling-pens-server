const { Worker } = require('bullmq');
const redisClient = require('../config/redis');
const MailService = require('../services/MailService');

const mailService = new MailService();

const MailWorker = new Worker(
    'mailQueue',
    async (job) => {
        const { data } = job;
        const type = job.name;

        try {
            switch (type) {
                case 'sendVerificationEmail':
                    await mailService._sendMail(data);
                    break;
                case 'sendOtpEmail':
                    await mailService._sendMail(data);
                    break;
                case 'sendResetPasswordEmail':
                    await mailService._sendMail(data);
                    break;
                case 'sendJanjiTemuNotification':
                    await mailService._sendMail(data);
                    break;
                case 'sendJanjiTemuAdminNotification':
                    await mailService._sendMail(data);
                    break;
                case 'sendJanjiTemuUpdateNotification':
                    await mailService._sendMail(data);
                    break;
                case 'sendEmail':
                    await mailService._sendMail(data);
                    break;
                default:
                    console.warn(`Unknown mail job type: ${type}`);
            }

            console.log(`Mail job ${job.id} (${type}) processed successfully.`);
        } catch (error) {
            console.error(`Error processing mail job ${job.id} (${type}):`, error.message);
            throw error; // agar BullMQ retry
        }
    },
    { connection: redisClient }
);

// Event handlers
MailWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed.`);
});

MailWorker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
});

MailWorker.on('error', (err) => {
    console.error(`Worker error:`, err.message);
});

module.exports = MailWorker;
