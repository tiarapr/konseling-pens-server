const ClientError = require('../../exceptions/ClientError');

class KonselingHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        // Bind methods
        this.getAllKonselingHandler = this.getAllKonselingHandler.bind(this);
        this.getKonselingByIdHandler = this.getKonselingByIdHandler.bind(this);
        this.postKonselingHandler = this.postKonselingHandler.bind(this);
        this.updateKonselingHandler = this.updateKonselingHandler.bind(this);
        this.updateStatusKonselingHandler = this.updateStatusKonselingHandler.bind(this);
        this.konfirmasiKehadiranHandler = this.konfirmasiKehadiranHandler.bind(this);
        this.deleteKonselingHandler = this.deleteKonselingHandler.bind(this);
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

    // Create new konseling
    async postKonselingHandler(request, h) {
        try {
            this._validator.validateCreatePayload(request.payload);
            const { janji_temu_id, konselor_profil_id, tanggal_konseling, jam_mulai, jam_selesai, lokasi, status_kehadiran, tanggal_konfirmasi, status_id } = request.payload;

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
                status_id,
                created_by: createdBy,
            });

            const response = h.response({
                status: 'success',
                message: 'Konseling successfully created',
                data: {
                    konseling: result,
                },
            });
            response.code(201); // HTTP status code for created
            return response;
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
            const { status_kehadiran, status_id } = request.payload;

            const updatedBy = request.auth.credentials.jwt.user.id;

            const updatedKonseling = await this._service.konfirmasiKehadiran(id, { status_kehadiran, status_id, updated_by: updatedBy });

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
            message: 'Sorry, there was an error on the server.',
        });
        response.code(500);
        return response;
    }
}

module.exports = KonselingHandler;
