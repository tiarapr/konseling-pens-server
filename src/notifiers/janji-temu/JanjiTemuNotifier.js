const MahasiswaService = require('../../services/MahasiswaService');
const UserService = require('../../services/UserService');
const MailService = require('../../services/MailService');
const WhatsappService = require('../../services/WhatsappService');

class JanjiTemuNotifier {
    constructor() {
        this._mailService = new MailService();
        this._whatsappService = new WhatsappService();
        this._userService = new UserService();
    }

    async notifyMahasiswaCreated(mahasiswa, user, appointment) {
        const notificationData = {
            type: 'JANJI_TEMU_CREATED',
            recipient: {
                name: mahasiswa.nama_lengkap,
                email: user.email,
                phone: user.phone_number,
            },
            appointment,
        };

        await this._whatsappService.sendJanjiTemuNotification(notificationData);
        await this._mailService.sendJanjiTemuNotification(
            user.email,
            { nama: mahasiswa.nama_lengkap },
            appointment
        );
    }

    async notifyAdminsCreated(mahasiswaNama, appointment) {
        const admins = await this._userService.getAdmins();

        const tasks = admins.map(async (admin) => {
            const adminNotificationData = {
                type: 'JANJI_TEMU_CREATED',
                isAdmin: true,
                recipient: {
                    name: admin.name,
                    email: admin.email,
                    phone: admin.phone_number,
                },
                mahasiswa: {
                    nama: mahasiswaNama,
                },
                appointment,
            };

            await this._whatsappService.sendAdminJanjiTemuNotification(adminNotificationData);
            await this._mailService.sendJanjiTemuAdminNotification(
                admin.email,
                { nama: mahasiswaNama },
                appointment
            );
        });

        await Promise.all(tasks);
    }

    async notifyMahasiswaStatusUpdated(mahasiswa, user, appointment) {
        const notificationData = {
            type: 'JANJI_TEMU_STATUS_UPDATED',
            recipient: {
                name: mahasiswa.nama_lengkap,
                email: user.email,
                phone: user.phone_number,
            },
            appointment,
        };

        await this._whatsappService.statusJanjiTemuUpdateNotification(notificationData);
        await this._mailService.sendJanjiTemuUpdateNotification(
            user.email,
            { nama: mahasiswa.nama_lengkap },
            appointment
        );
    }
}

module.exports = JanjiTemuNotifier;
