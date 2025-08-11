const ClientError = require('../../exceptions/ClientError');

class KonselingHandler {
    constructor(service, statusService, userService, mahasiswaService, konselorProfileService, notifier, validator) {
        this._service = service;
        this._statusService = statusService;
        this._konselorProfileService = konselorProfileService;
        this._validator = validator;
        this._mahasiswaService = mahasiswaService;
        this._userService = userService;
        this._notifier = notifier;

        // Bind methods
        this.getAllKonselingHandler = this.getAllKonselingHandler.bind(this);
        this.getMyKonselingHandler = this.getMyKonselingHandler.bind(this);
        this.getKonselingByIdHandler = this.getKonselingByIdHandler.bind(this);
        this.getKonselingByKonselorIdHandler = this.getKonselingByKonselorIdHandler.bind(this);
        this.postKonselingHandler = this.postKonselingHandler.bind(this);
        this.updateStatusKonselingHandler = this.updateStatusKonselingHandler.bind(this);
        this.konfirmasiKehadiranHandler = this.konfirmasiKehadiranHandler.bind(this);
        this.deleteKonselingHandler = this.deleteKonselingHandler.bind(this);
        this.rescheduleKonselingHandler = this.rescheduleKonselingHandler.bind(this);
    }

    async postKonselingHandler(request, h) {
        try {
            this._validator.validateCreatePayload(request.payload);
            const { janji_temu_id, konselor_profil_id, tanggal_konseling, jam_mulai, jam_selesai, lokasi, status_kehadiran, tanggal_konfirmasi } = request.payload;
            const status = await this._statusService.getByKodeStatus('dijadwalkan');
            const createdBy = request.auth.credentials.jwt.user.id;

            const result = await this._service.create({
                janji_temu_id,
                konselor_profil_id,
                tanggal_konseling,
                jam_mulai,
                jam_selesai,
                lokasi,
                status_kehadiran,
                tanggal_konfirmasi,
                status_id: status.id,
                created_by: createdBy,
            });

            const konseling = await this._service.getById(result.id);

            // Notifikasi
            await this._notifier.notifyCreatedMahasiswa(konseling);
            await this._notifier.notifyCreatedKonselor(konseling);

            return h.response({
                status: 'success',
                message: 'Konseling successfully created',
                data: { konseling },
            }).code(201);
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async getAllKonselingHandler(request, h) {
        try {
            const data = await this._service.getAll();
            return { status: 'success', data: { konseling: data } };
        } catch (error) {
            return this._handleServerError(h, error);
        }
    }

    async getKonselingByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const data = await this._service.getById(id);
            return { status: 'success', data: { konseling: data } };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async getMyKonselingHandler(request, h) {
        try {
            const userId = request.auth.credentials.jwt.user.id;
            const mahasiswa = await this._mahasiswaService.getByUserId(userId);
            if (!mahasiswa) throw new ClientError('Data mahasiswa tidak ditemukan', 404);

            const konselingList = await this._service.getByNrp(mahasiswa.nrp);
            return { status: 'success', data: { konseling: konselingList } };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async getKonselingByKonselorIdHandler(request, h) {
        try {
            const userId = request.auth.credentials.jwt.user.id;
            const konselor = await this._konselorProfileService.getByUserId(userId);
            if (!konselor) throw new ClientError('Data konselor tidak ditemukan', 404);

            const konselingList = await this._service.getByKonselorId(konselor.id);
            return { status: 'success', data: { konseling: konselingList } };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async updateStatusKonselingHandler(request, h) {
        try {
            const { id } = request.params;
            this._validator.validateUpdateStatusPayload(request.payload);
            const { status_id } = request.payload;
            const updatedBy = request.auth.credentials.jwt.user.id;

            const updatedKonseling = await this._service.updateStatus(id, {
                status_id,
                updated_by: updatedBy,
            });

            const konseling = await this._service.getById(id);

            // Cek kode status
            const status = await this._statusService.getById(status_id);

            // Kirim notifikasi berdasarkan status
            if (status.kode_status === 'dibatalkan') {
                await this._notifier.notifyCancellation(konseling);
            }

            return {
                status: 'success',
                message: 'Konseling status successfully updated',
                data: { konseling: updatedKonseling },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async konfirmasiKehadiranHandler(request, h) {
        try {
            const { id } = request.params;
            const { status_kehadiran } = request.payload;
            let status_id = request.payload.status_id;

            const updatedBy = request.auth.credentials.jwt.user.id;
            if (status_kehadiran === false) {
                const status = await this._statusService.getByKodeStatus('batal_otomatis');
                status_id = status.id;
            }

            const updatedKonseling = await this._service.konfirmasiKehadiran(id, {
                status_kehadiran,
                status_id,
                updated_by: updatedBy,
            });

            const konseling = await this._service.getById(updatedKonseling.id);
            await this._notifier.notifyConfirmationStatus(konseling);

            return { status: 'success', message: 'Kehadiran konseling berhasil dikonfirmasi', data: { konseling: updatedKonseling } };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async rescheduleKonselingHandler(request, h) {
        try {
            const { id } = request.params;
            this._validator.validateUpdatePayload(request.payload);
            const { tanggal_konseling, jam_mulai, jam_selesai, lokasi, status_kehadiran, tanggal_konfirmasi, konselor_profil_id } = request.payload;

            const status = await this._statusService.getByKodeStatus('dijadwalkan_ulang');
            const updatedBy = request.auth.credentials.jwt.user.id;

            // Ambil data konseling lama untuk perbandingan
            const existingKonseling = await this._service.getById(id);
            const oldKonselorId = existingKonseling.konselor.id || existingKonseling.konselor_profil_id;

            // Update data konseling dengan yang baru
            const updatedKonseling = await this._service.update(id, {
                tanggal_konseling,
                jam_mulai,
                jam_selesai,
                lokasi,
                status_kehadiran,
                tanggal_konfirmasi,
                status_id: status.id,
                konselor_profil_id,
                updated_by: updatedBy,
            });

            if (!updatedKonseling) {
                throw new ClientError('Gagal memperbarui konseling', 500);
            }

            // Ambil data konseling setelah diupdate
            const konseling = await this._service.getById(updatedKonseling.id);

            // Notifikasi
            if (oldKonselorId === konselor_profil_id) {
                await this._notifier.notifyRescheduleKonselor(konseling);
            } else {
                await this._notifier.notifyCreatedKonselor(konseling);
            }

            await this._notifier.notifyRescheduleMahasiswa(konseling);

            return { status: 'success', message: 'Konseling successfully rescheduled', data: { konseling: updatedKonseling } };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async deleteKonselingHandler(request, h) {
        try {
            const { id } = request.params;
            const deletedBy = request.auth.credentials.jwt.user.id;
            const result = await this._service.softDelete(id, deletedBy);

            return { status: 'success', message: 'Konseling successfully deleted', data: { konseling: result } };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    _handleError(h, error) {
        if (error instanceof ClientError) {
            return h.response({ status: 'fail', message: error.message }).code(error.statusCode);
        }
        return this._handleServerError(h, error);
    }

    _handleServerError(h, error) {
        console.error(error);
        return h.response({ status: 'error', message: error.message || 'Terjadi kesalahan pada server' }).code(500);
    }
}

module.exports = KonselingHandler;
