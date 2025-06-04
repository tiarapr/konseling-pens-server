const ClientError = require('../../exceptions/ClientError');
const MahasiswaService = require('../../services/MahasiswaService');
const UserService = require('../../services/UserService');
const WhatsAppService = require('../../services/WhatsAppService');

class KonselingHandler {
    constructor(service, statusService, konselorProfileService, validator) {
        this._service = service;
        this._statusService = statusService;
        this._konselorProfileService = konselorProfileService;
        this._validator = validator;
        this._mahasiswaService = new MahasiswaService();
        this._userService = new UserService();
        this._whatsappService = new WhatsAppService();

        // Bind methods
        this.getAllKonselingHandler = this.getAllKonselingHandler.bind(this);
        this.getMyKonselingHandler = this.getMyKonselingHandler.bind(this);
        this.getKonselingByIdHandler = this.getKonselingByIdHandler.bind(this);
        this.getKonselingByKonselorIdHandler = this.getKonselingByKonselorIdHandler.bind(this);
        this.postKonselingHandler = this.postKonselingHandler.bind(this);
        this.updateKonselingHandler = this.updateKonselingHandler.bind(this);
        this.updateStatusKonselingHandler = this.updateStatusKonselingHandler.bind(this);
        this.konfirmasiKehadiranHandler = this.konfirmasiKehadiranHandler.bind(this);
        this.deleteKonselingHandler = this.deleteKonselingHandler.bind(this);
        this.rescheduleKonselingHandler = this.rescheduleKonselingHandler.bind(this);
    }

    // Create new konseling
    async postKonselingHandler(request, h) {
        try {
            this._validator.validateCreatePayload(request.payload);
            const { janji_temu_id, konselor_profil_id, tanggal_konseling, jam_mulai, jam_selesai, lokasi, status_kehadiran, tanggal_konfirmasi } = request.payload;

            const status = await this._statusService.getByKodeStatus('dijadwalkan');
            const statusId = status.id;
            const createdBy = request.auth.credentials.jwt.user.id;

            // Step 1: Buat konseling
            const result = await this._service.create({
                janji_temu_id,
                konselor_profil_id,
                tanggal_konseling,
                jam_mulai,
                jam_selesai,
                lokasi,
                status_kehadiran,
                tanggal_konfirmasi,
                status_id: statusId,
                created_by: createdBy,
            });

            // Step 2: Ambil detail lengkap dari konseling yang baru dibuat
            const konseling = await this._service.getById(result.id);

            // Step 3: Ambil user data (mahasiswa dan user WhatsApp)
            const mahasiswa = await this._mahasiswaService.getByNrp(konseling.janji_temu.nrp);
            const user = await this._userService.getUserById(mahasiswa.user_id);

            const tanggal = new Date(konseling.tanggal_konseling).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            const waktu = `${konseling.jam_mulai.substring(0, 5)} - ${konseling.jam_selesai.substring(0, 5)}`;

            // Step 4: Kirim notifikasi WhatsApp
            const dataNotif = {
                recipient: {
                    name: mahasiswa.nama_lengkap,
                    phone: user.phone_number,
                },
                konseling: {
                    konselor: konseling.konselor.nama,
                    tanggal: tanggal,
                    waktu: waktu,
                    lokasi: konseling.lokasi,
                },
            };

            await this._whatsappService.sendJadwalKonselingNotification(dataNotif);

            return h.response({
                status: 'success',
                message: 'Konseling successfully created',
                data: {
                    konseling: konseling, // ← kirim full detail, bukan cuma id
                },
            }).code(201);

        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Get all konseling records
    async getAllKonselingHandler(request, h) {
        try {
            const data = await this._service.getAll();
            return {
                status: 'success',
                data: {
                    konseling: data,
                },
            };
        } catch (error) {
            return this._handleServerError(h, error);
        }
    }

    // Get konseling by ID
    async getKonselingByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const data = await this._service.getById(id);
            return {
                status: 'success',
                data: {
                    konseling: data,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async getMyKonselingHandler(request, h) {
        try {
            const userId = request.auth.credentials.jwt.user.id;

            // Step 1: Cari data mahasiswa berdasarkan userId
            const mahasiswa = await this._mahasiswaService.getByUserId(userId);
            if (!mahasiswa) {
                throw new ClientError('Data mahasiswa tidak ditemukan', 404);
            }

            // Step 2: Ambil semua data konseling berdasarkan NRP mahasiswa
            const konselingList = await this._service.getByNrp(mahasiswa.nrp);

            return {
                status: 'success',
                data: {
                    konseling: konselingList,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async getKonselingByKonselorIdHandler(request, h) {
        try {
            const userId = request.auth.credentials.jwt.user.id;

            const konselor = await this._konselorProfileService.getByUserId(userId);
            if (!konselor) {
                throw new ClientError('Data konselor tidak ditemukan', 404);
            }

            const konselingList = await this._service.getByKonselorId(konselor.id); 

            return {
                status: 'success',
                data: {
                    konseling: konselingList,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Update konseling by ID
    async updateKonselingHandler(request, h) {
        try {
            const { id } = request.params;
            this._validator.validateUpdatePayload(request.payload);
            const { tanggal_konseling, jam_mulai, jam_selesai, lokasi, status_kehadiran, tanggal_konfirmasi, status_id, konselor_profil_id } = request.payload;

            const updatedBy = request.auth.credentials.jwt.user.id;

            const updatedKonseling = await this._service.update(id, {
                tanggal_konseling,
                jam_mulai,
                jam_selesai,
                lokasi,
                status_kehadiran,
                tanggal_konfirmasi,
                status_id,
                konselor_profil_id,
                updated_by: updatedBy,
            });

            return {
                status: 'success',
                message: 'Konseling successfully updated',
                data: {
                    konseling: updatedKonseling,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Update status konseling by ID
    async updateStatusKonselingHandler(request, h) {
        try {
            const { id } = request.params;
            this._validator.validateUpdateStatusPayload(request.payload);
            const { status_id } = request.payload;
            const updatedBy = request.auth.credentials.jwt.user.id;
            const updatedKonseling = await this._service.updateStatus(id, { status_id, updated_by: updatedBy });

            return {
                status: 'success',
                message: 'Konseling status successfully updated',
                data: {
                    konseling: updatedKonseling,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Konfirmasi Kehadiran
    async konfirmasiKehadiranHandler(request, h) {
        try {
            const { id } = request.params;
            const { status_kehadiran } = request.payload;

            // Default status_id to the existing one or keep it
            let status_id = request.payload.status_id;

            const updatedBy = request.auth.credentials.jwt.user.id;

            // If attendance status is 'false', set the status_id to 'batal_otomatis'
            if (status_kehadiran === false) {
                const status = await this._statusService.getByKodeStatus('batal_otomatis');
                status_id = status.id;  // Automatically set status_id to 'batal_otomatis'
            }

            const updatedKonseling = await this._service.konfirmasiKehadiran(id, {
                status_kehadiran,
                status_id,
                updated_by: updatedBy
            });

            return {
                status: 'success',
                message: 'Kehadiran konseling berhasil dikonfirmasi',
                data: {
                    konseling: updatedKonseling,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async rescheduleKonselingHandler(request, h) {
        try {
            const { id } = request.params;

            this._validator.validateUpdatePayload(request.payload);

            const { tanggal_konseling, jam_mulai, jam_selesai, lokasi, status_kehadiran, tanggal_konfirmasi, konselor_profil_id } = request.payload;

            const status = await this._statusService.getByKodeStatus('didijadwalkan_ulang');
            const statusId = status.id;

            const updatedBy = request.auth.credentials.jwt.user.id;

            const updatedKonseling = await this._service.update(id, {
                tanggal_konseling,
                jam_mulai,
                jam_selesai,
                lokasi,
                status_kehadiran,
                tanggal_konfirmasi,
                status_id: statusId,
                konselor_profil_id,
                updated_by: updatedBy,
            });

            return {
                status: 'success',
                message: 'Konseling successfully updated',
                data: {
                    konseling: updatedKonseling,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Soft delete konseling by ID
    async deleteKonselingHandler(request, h) {
        try {
            const { id } = request.params;

            const deletedBy = request.auth.credentials.jwt.user.id;

            const result = await this._service.softDelete(id, deletedBy);

            return {
                status: 'success',
                message: 'Konseling successfully deleted',
                data: {
                    konseling: result,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Handle ClientError responses
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

    // Handle unexpected server errors
    _handleServerError(h, error) {
        console.error(error);
        const response = h.response({
            status: 'error',
            message: error.message || 'Maaf, terjadi kegagalan pada server kami.',
        });
        response.code(500);
        return response;
    }
}

module.exports = KonselingHandler;
