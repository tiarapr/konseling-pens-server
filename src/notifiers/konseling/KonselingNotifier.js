const MahasiswaService = require('../../services/MahasiswaService');
const UserService = require('../../services/UserService');
const MailService = require('../../services/MailService');
const WhatsappService = require('../../services/WhatsappService');
const KonselorProfilService = require('../../services/KonselorProfilService');

class KonselingNotifier {
    constructor() {
        this._mailService = new MailService();
        this._whatsappService = new WhatsappService();
        this._userService = new UserService();
        this._mahasiswaService = new MahasiswaService();
        this._konselorProfilService = new KonselorProfilService();
    }

    async notifyCreatedMahasiswa(konseling) {
        const jadwal = this._formatJadwal(konseling);

        const data = {
            recipient: {
                name: konseling.mahasiswa.nama,
                phone: konseling.mahasiswa.no_telp,
            },
            konseling: jadwal,
        };

        await this._whatsappService.sendJadwalKonselingMahasiswaNotification(data);

        const mahasiswa = await this._mahasiswaService.getByNrp(konseling.mahasiswa.nrp);

        if (mahasiswa.user_id) {
            const user = await this._userService.getUserById(mahasiswa.user_id);
            await this._mailService.sendJadwalKonselingMahasiswaNotification(
                user.email,
                { nama: konseling.mahasiswa.nama },
                jadwal
            );
        }
    }

    async notifyCreatedKonselor(konseling) {
        const jadwal = this._formatJadwal(konseling);
        const detail = {
            ...jadwal,
            mahasiswa: konseling.mahasiswa.nama,
            statusKehadiran: this._statusKehadiran(konseling.status_kehadiran),
            statusKonseling: konseling.status?.name || '-',
        };

        const data = {
            recipient: {
                name: konseling.konselor?.nama,
                phone: konseling.konselor?.no_telp,
            },
            konseling: detail,
        };

        await this._whatsappService.sendJadwalKonselingKonselorNotification(data);

        const konselor = await this._konselorProfilService.getById(konseling.konselor.id);

        if (konselor?.user_id) {
            const user = await this._userService.getUserById(konselor.user_id);
            await this._mailService.sendJadwalKonselingKonselorNotification(
                user.email,
                { nama: konseling.konselor.nama },
                detail
            );
        }
    }

    async notifyRescheduleMahasiswa(konseling) {
        const jadwal = this._formatJadwal(konseling);

        const data = {
            recipient: {
                name: konseling.mahasiswa.nama,
                phone: konseling.mahasiswa.no_telp,
            },
            konseling: jadwal,
        };

        await this._whatsappService.sendPembaruanJadwalKonselingMahasiswaNotification(data);

        const mahasiswa = await this._mahasiswaService.getByNrp(konseling.mahasiswa.nrp);

        if (mahasiswa.user_id) {
            const user = await this._userService.getUserById(mahasiswa.user_id);
            await this._mailService.sendPembaruanJadwalKonselingMahasiswaNotification(
                user.email,
                { nama: konseling.mahasiswa.nama },
                jadwal
            );
        }
    }

    async notifyRescheduleKonselor(konseling) {
        const jadwal = this._formatJadwal(konseling);
        const detail = {
            ...jadwal,
            mahasiswa: konseling.mahasiswa.nama,
            statusKehadiran: this._statusKehadiran(konseling.status_kehadiran),
            statusKonseling: konseling.status?.name || '-',
        };

        const data = {
            recipient: {
                name: konseling.konselor?.nama,
                phone: konseling.konselor?.no_telp,
            },
            konseling: detail,
        };

        await this._whatsappService.sendPembaruanJadwalKonselingKonselorNotification(data);

        const konselor = await this._konselorProfilService.getById(konseling.konselor.id);

        if (konselor?.user_id) {
            const user = await this._userService.getUserById(konselor.user_id);
            await this._mailService.sendPembaruanJadwalKonselingKonselorNotification(
                user.email,
                { nama: konseling.konselor.nama },
                detail
            );
        }
    }

    async notifyConfirmationStatus(konseling) {
        const jadwal = this._formatJadwal(konseling);
        const statusKehadiran = this._statusKehadiran(konseling.status_kehadiran);
        const statusKonseling = konseling.status?.name || '-';

        const mahasiswa = await this._mahasiswaService.getByNrp(konseling.mahasiswa.nrp);
        const konselor = await this._konselorProfilService.getById(konseling.konselor.id);

        // WhatsApp untuk Mahasiswa
        const dataMahasiswa = {
            recipient: {
                name: konseling.mahasiswa.nama,
                phone: konseling.mahasiswa.no_telp,
            },
            konseling: {
                ...jadwal,
                konselor: konseling.konselor.nama,
                statusKonseling,
                statusKehadiran,
            },
        };

        if (konseling.status_kehadiran === false) {
            await this._whatsappService.sendKonfirmasiKetidakehadiranMahasiswa(dataMahasiswa);
        } else if (konseling.status_kehadiran === true) {
            await this._whatsappService.sendKonfirmasiKehadiranMahasiswa(dataMahasiswa);
        }

        // Email untuk Mahasiswa
        if (mahasiswa.user_id) {
            const user = await this._userService.getUserById(mahasiswa.user_id);

            if (konseling.status_kehadiran === false) {
                await this._mailService.sendKetidakhadiranMahasiswa(
                    user.email,
                    { nama: konseling.mahasiswa.nama },
                    { ...jadwal, status_kehadiran: statusKehadiran, status: statusKonseling }
                );
            } else if (konseling.status_kehadiran === true) {
                await this._mailService.sendKonfirmasiKehadiranMahasiswa(
                    user.email,
                    { nama: konseling.mahasiswa.nama },
                    { ...jadwal, status_kehadiran: statusKehadiran }
                );
            }
        }

        // WhatsApp untuk Konselor
        const dataKonselor = {
            recipient: {
                name: konseling.konselor?.nama,
                phone: konseling.konselor?.no_telp,
            },
            konseling: {
                ...jadwal,
                mahasiswa: konseling.mahasiswa.nama,
                statusKonseling,
                statusKehadiran,
            },
        };

        if (konseling.status_kehadiran === false) {
            await this._whatsappService.sendKonfirmasiKetidakehadiranKonselor(dataKonselor);
        } else if (konseling.status_kehadiran === true) {
            await this._whatsappService.sendKonfirmasiKehadiranKonselor(dataKonselor);
        }

        // Email untuk Konselor
        if (konselor?.user_id) {
            const user = await this._userService.getUserById(konselor.user_id);

            if (konseling.status_kehadiran === false) {
                await this._mailService.sendKetidakhadiranKonselor(
                    user.email,
                    { nama: konseling.konselor.nama },
                    {
                        ...jadwal,
                        mahasiswa: konseling.mahasiswa.nama,
                        status_kehadiran: statusKehadiran,
                        status: statusKonseling,
                    }
                );
            } else if (konseling.status_kehadiran === true) {
                await this._mailService.sendKonfirmasiKehadiranKonselor(
                    user.email,
                    { nama: konseling.konselor.nama },
                    {
                        ...jadwal,
                        mahasiswa: konseling.mahasiswa.nama,
                        status_kehadiran: statusKehadiran,
                    }
                );
            }
        }

        // WhatsApp & Email untuk Admin
        const admins = await this._userService.getAdmins();
        if (Array.isArray(admins)) {
            for (const admin of admins) {
                if (!admin.email) continue;

                const dataAdmin = {
                    recipient: {
                        name: admin.name,
                        email: admin.email,
                        phone: admin.phone_number,
                    },
                    konseling: {
                        ...jadwal,
                        mahasiswa: konseling.mahasiswa.nama,
                        konselor: konseling.konselor.nama,
                        statusKonseling,
                        statusKehadiran,
                    },
                };

                if (konseling.status_kehadiran === false) {
                    await this._whatsappService.sendKonfirmasiKetidakehadiranAdmin(dataAdmin);
                    await this._mailService.sendKetidakhadiranAdmin(
                        admin.email,
                        {
                            mahasiswa: konseling.mahasiswa.nama,
                            konselor: konseling.konselor.nama,
                            ...jadwal,
                            status_kehadiran: statusKehadiran,
                            status: statusKonseling,
                        }
                    );
                } else if (konseling.status_kehadiran === true) {
                    await this._whatsappService.sendKonfirmasiKehadiranAdmin(dataAdmin);
                    await this._mailService.sendKonfirmasiKehadiranAdmin(
                        admin.email,
                        {
                            mahasiswa: konseling.mahasiswa.nama,
                            konselor: konseling.konselor.nama,
                            ...jadwal,
                            status_kehadiran: statusKehadiran,
                        }
                    );
                }
            }
        }
    }

    async notifyCancellation(konseling) {
        const jadwal = this._formatJadwal(konseling);
        const statusKonseling = konseling.status?.name || '-';

        const mahasiswa = await this._mahasiswaService.getByNrp(konseling.mahasiswa.nrp);
        const konselor = await this._konselorProfilService.getById(konseling.konselor.id);

        // WhatsApp - Mahasiswa
        const waDataMahasiswa = {
            recipient: {
                name: konseling.mahasiswa.nama,
                phone: konseling.mahasiswa.no_telp,
            },
            konseling: {
                ...jadwal,
                konselor: konseling.konselor.nama,
                statusKonseling,
            },
        };
        await this._whatsappService.sendPembatalanMahasiswa(waDataMahasiswa);

        // Email - Mahasiswa
        if (mahasiswa.user_id) {
            const user = await this._userService.getUserById(mahasiswa.user_id);
            await this._mailService.sendPembatalanMahasiswa(user.email, konseling.mahasiswa, {
                ...jadwal,
                statusKonseling,
            });
        }

        // WhatsApp - Konselor
        const waDataKonselor = {
            recipient: {
                name: konseling.konselor.nama,
                phone: konseling.konselor.no_telp,
            },
            konseling: {
                ...jadwal,
                mahasiswa: konseling.mahasiswa.nama,
                statusKonseling,
            },
        };
        await this._whatsappService.sendPembatalanKonselor(waDataKonselor);

        // Email - Konselor
        if (konselor?.user_id) {
            const user = await this._userService.getUserById(konselor.user_id);
            await this._mailService.sendPembatalanKonselor(user.email, konseling.konselor, {
                ...jadwal,
                mahasiswa: konseling.mahasiswa.nama,
                statusKonseling,
            });
        }
    }

    async notifySelesaiKonseling(konseling) {
        const jadwal = this._formatJadwal(konseling);

        // Data untuk Mahasiswa
        const dataMahasiswa = {
            recipient: {
                name: konseling.mahasiswa.nama,
                phone: konseling.mahasiswa.no_telp,
            },
            konseling: jadwal,
        };

        // Mengirim WhatsApp ke Mahasiswa
        await this._whatsappService.sendKonselingSelesaiNotification(dataMahasiswa);

        // Mengirim Email ke Mahasiswa
        const mahasiswa = await this._mahasiswaService.getByNrp(konseling.mahasiswa.nrp);
        if (mahasiswa.user_id) {
            const user = await this._userService.getUserById(mahasiswa.user_id);
            await this._mailService.sendKonselingSelesai(
                user.email,
                { nama: konseling.mahasiswa.nama },
                jadwal
            );
        }
    }

    _formatJadwal(konseling) {
        const tanggal = new Date(konseling.tanggal_konseling).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        const waktu = `${konseling.jam_mulai?.substring(0, 5)} - ${konseling.jam_selesai?.substring(0, 5)} WIB`;

        return {
            konselor: konseling.konselor?.nama || '-',
            tanggal,
            waktu,
            lokasi: konseling.lokasi,
        };
    }

    _statusKehadiran(status) {
        if (status === true) return 'Hadir';
        if (status === false) return 'Tidak Hadir';
        return 'Belum Dikonfirmasi';
    }
}

module.exports = KonselingNotifier;
