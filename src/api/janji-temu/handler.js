const ClientError = require('../../exceptions/ClientError');

class JanjiTemuHandler {
    constructor(service, mahasiswaService, userService, mailService, whatsappService, validator) {
        this._service = service;
        this._validator = validator;
        this._mahasiswaService = mahasiswaService;
        this._userService = userService;
        this._mailService = mailService;
        this._whatsappService = whatsappService;

        this.getAllJanjiTemuHandler = this.getAllJanjiTemuHandler.bind(this);
        this.getJanjiTemuByIdHandler = this.getJanjiTemuByIdHandler.bind(this);
        this.getMyJanjiTemuHandler = this.getMyJanjiTemuHandler.bind(this);
        this.createJanjiTemuHandler = this.createJanjiTemuHandler.bind(this);
        this.updateStatusJanjiTemuHandler = this.updateStatusJanjiTemuHandler.bind(this);
        this.deleteJanjiTemuHandler = this.deleteJanjiTemuHandler.bind(this);
        this.notifyAdmins = this.notifyAdmins.bind(this);
    }

    async createJanjiTemuHandler(request, h) {
        try {
            this._validator.validateCreatePayload(request.payload);

            const {
                nrp,
                tipe_konsultasi,
                preferensi_konselor_id,
                jadwal_utama_tanggal,
                jadwal_utama_jam_mulai,
                jadwal_utama_jam_selesai,
                jadwal_alternatif_tanggal,
                jadwal_alternatif_jam_mulai,
                jadwal_alternatif_jam_selesai,
            } = request.payload;

            const createdBy = request.auth.credentials.jwt.user.id;

            const result = await this._service.create({
                nrp,
                tipe_konsultasi,
                preferensi_konselor_id,
                jadwal_utama_tanggal,
                jadwal_utama_jam_mulai,
                jadwal_utama_jam_selesai,
                jadwal_alternatif_tanggal,
                jadwal_alternatif_jam_mulai,
                jadwal_alternatif_jam_selesai,
                created_by: createdBy,
            });

            const { nomor_tiket } = result;

            const mahasiswa = await this._mahasiswaService.getByNrp(nrp);
            const user = await this._userService.getUserById(mahasiswa.user_id);

            const jadwalUtama = `${jadwal_utama_tanggal} ${jadwal_utama_jam_mulai} - ${jadwal_utama_jam_selesai}`;
            const jadwalAlternatif = `${jadwal_alternatif_tanggal} ${jadwal_alternatif_jam_mulai} - ${jadwal_alternatif_jam_selesai}`;

            const notificationData = {
                type: 'JANJI_TEMU_CREATED',
                recipient: {
                    name: mahasiswa.nama_lengkap,
                    email: user.email,
                    phone: user.phone_number,
                },
                appointment: {
                    nomor_tiket,
                    tipe_konsultasi,
                    jadwal_utama: jadwalUtama,
                    jadwal_alternatif: jadwalAlternatif,
                    status: 'Menunggu Konfirmasi',
                },
            };

            await this._whatsappService.sendJanjiTemuNotification(notificationData);

            await this._mailService.sendJanjiTemuNotification(
                user.email,
                { nama: mahasiswa.nama_lengkap },
                notificationData.appointment
            );

            this.notifyAdmins({
                mahasiswa: mahasiswa.nama_lengkap,
                ...notificationData.appointment,
            });

            const response = h.response({
                status: 'success',
                message: 'Janji temu berhasil dibuat',
                data: { janjiTemu: result },
            });
            response.code(201);
            return response;
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async notifyAdmins(appointmentData) {
        try {
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
                        nama: appointmentData.mahasiswa,
                    },
                    appointment: {
                        nomor_tiket: appointmentData.nomor_tiket,
                        tipe_konsultasi: appointmentData.tipe_konsultasi,
                        jadwal_utama: appointmentData.jadwal_utama,
                        jadwal_alternatif: appointmentData.jadwal_alternatif,
                        status: appointmentData.status,
                    },
                };

                await this._whatsappService.sendAdminJanjiTemuNotification(adminNotificationData);
                await this._mailService.sendJanjiTemuAdminNotification(
                    admin.email,
                    { nama: appointmentData.mahasiswa },
                    adminNotificationData.appointment
                );
            });

            await Promise.all(tasks);
        } catch (error) {
            console.error('Error sending notifications to admins:', error);
        }
    }

    async getAllJanjiTemuHandler(request, h) {
        try {
            const data = await this._service.getAll();
            return {
                status: 'success',
                data: { janjiTemu: data },
            };
        } catch (error) {
            return this._handleServerError(h, error);
        }
    }

    async getJanjiTemuByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const data = await this._service.getById(id);
            return {
                status: 'success',
                data: { janjiTemu: data },
            };
        } catch (error) {
            return this._handleServerError(h, error);
        }
    }

    async getMyJanjiTemuHandler(request, h) {
        try {
            const userId = request.auth.credentials.jwt.user.id;

            // Ambil data mahasiswa berdasarkan userId
            const mahasiswa = await this._mahasiswaService.getByUserId(userId);
            if (!mahasiswa) {
                throw new ClientError('Data mahasiswa tidak ditemukan', 404);
            }

            // Ambil janji temu berdasarkan NRP mahasiswa
            const janjiTemuList = await this._service.getByNrp(mahasiswa.nrp);

            return {
                status: 'success',
                data: {
                    janjiTemu: janjiTemuList,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async updateStatusJanjiTemuHandler(request, h) {
        try {
            const { id } = request.params;
            this._validator.validateUpdatePayload(request.payload);

            const { status, alasan_penolakan } = request.payload;
            const updated_by = request.auth.credentials.jwt.user.id;

            const updatedJanjiTemu = await this._service.updateStatus(id, {
                status,
                updated_by,
                alasan_penolakan,
            });

            const janjiTemuData = await this._service.getById(id);
            const mahasiswa = await this._mahasiswaService.getByNrp(janjiTemuData.nrp);
            const user = await this._userService.getUserById(mahasiswa.user_id);

            const notificationData = {
                type: 'JANJI_TEMU_STATUS_UPDATED',
                recipient: {
                    name: mahasiswa.nama_lengkap,
                    email: user.email,
                    phone: user.phone_number,
                },
                appointment: {
                    nomorTiket: janjiTemuData.nomor_tiket,
                    tipeKonsultasi: janjiTemuData.tipe_konsultasi,
                    jadwalUtama: `${janjiTemuData.jadwal_utama_tanggal} ${janjiTemuData.jadwal_utama_jam_mulai} - ${janjiTemuData.jadwal_utama_jam_selesai}`,
                    jadwalAlternatif: `${janjiTemuData.jadwal_alternatif_tanggal} ${janjiTemuData.jadwal_alternatif_jam_mulai} - ${janjiTemuData.jadwal_alternatif_jam_selesai}`,
                    status: janjiTemuData.status,
                },
            };

            await this._whatsappService.statusJanjiTemuUpdateNotification(notificationData);
            await this._mailService.sendJanjiTemuUpdateNotification(
                user.email,
                { nama: mahasiswa.nama_lengkap },
                notificationData.appointment
            );

            return {
                status: 'success',
                message: 'Status janji temu berhasil diperbarui',
                data: { janjiTemu: updatedJanjiTemu },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async deleteJanjiTemuHandler(request, h) {
        try {
            const { id } = request.params;
            const deletedBy = request.auth.credentials.jwt.user.id;
            const result = await this._service.softDelete(id, deletedBy);

            return {
                status: 'success',
                message: 'Janji temu berhasil dihapus',
                data: { janjiTemu: result },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    _handleError(h, error) {
        if (error instanceof ClientError) {
            const response = h.response({
                status: 'fail',
                message: error.message,
            });
            response.code(error.statusCode);
            return response;
        }
        return this._handleServerError(h, error);
    }

    _handleServerError(h, error) {
        console.error(error);
        const response = h.response({
            status: 'error',
            message: 'Maaf, terjadi kegagalan pada server kami.',
        });
        response.code(500);
        return response;
    }
}

module.exports = JanjiTemuHandler;
