const { Worker } = require('bullmq');
const redisConfig = require('../config/redis');
const WhatsAppService = require('../services/WhatsappService');

const whatsappService = new WhatsAppService();

const WhatsappWorker = new Worker(
    '{whatsappQueue}',
    async (job) => {
        const { type, data } = job.data;

        try {
            switch (type) {
                case 'sendTemplateMessage':
                    await whatsappService.sendTemplateMessage(
                        data.phone,
                        data.templateName,
                        data.languageCode,
                        data.parameters,
                        data.extraComponents
                    );
                    break;
                default:
                    console.warn(`Unknown WhatsApp job type: ${type}`);
            }

            console.log(`✅ WhatsApp job ${job.id} (${type}) processed successfully.`);
        } catch (error) {
            console.error(
                `❌ Error processing WhatsApp job ${job.id} (${type}):`,
                error.message
            );
            throw error; 
        }
    },
    {
        connection: redisConfig,
        prefix: '{whatsappQueue}',
    }
);

// Event handlers
WhatsappWorker.on('completed', (job) => {
    console.log(`🎉 Job ${job.id} has completed!`);
});

WhatsappWorker.on('failed', (job, err) => {
    console.log(`❌ Job ${job.id} has failed with error: ${err.message}`);
});

WhatsappWorker.on('error', (err) => {
    console.error(`💥 Worker error: ${err.message}`);
});

module.exports = WhatsappWorker;
