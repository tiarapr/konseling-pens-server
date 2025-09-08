const { Worker } = require('bullmq');
const redisConfig = require('../config/redis');
const MailService = require('../services/MailService');

const mailService = new MailService();

const MailWorker = new Worker(
    '{mailQueue}',
    async (job) => {
        const { data } = job;
        const type = job.name;

        try {
            switch (type) {
                case 'sendVerificationEmail':
                case 'sendOtpEmail':
                case 'sendResetPasswordEmail':
                case 'sendJanjiTemuNotification':
                case 'sendJanjiTemuAdminNotification':
                case 'sendJanjiTemuUpdateNotification':
                case 'sendJadwalKonselingNotification':
                case 'sendEmail':
                case 'sendKonfirmasiKehadiranMahasiswa':
                case 'sendKetidakhadiranMahasiswa':
                case 'sendKonfirmasiKehadiranAdmin':
                case 'sendKetidakhadiranAdmin':
                case 'sendKonfirmasiKehadiranKonselor':
                case 'sendKetidakhadiranKonselor':
                case 'sendPembatalanMahasiswa':
                case 'sendPembatalanKonselor':
                case 'sendKonselingSelesai':
                    await mailService._sendMail(data);
                    break;
                default:
                    console.warn(`Unknown mail job type: ${type}`);
            }

            console.log(`Mail job ${job.id} (${type}) processed successfully.`);
        } catch (error) {
            console.error(`Error processing mail job ${job.id} (${type}):`, error.message);
            throw error;
        }
    },
    {
        connection: redisConfig,
        prefix: '{mailQueue}'
    }
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
