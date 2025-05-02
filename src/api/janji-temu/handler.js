const ClientError = require('../../exceptions/ClientError');

class JanjiTemuHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        // Bind methods to this
        this.getAllJanjiTemuHandler = this.getAllJanjiTemuHandler.bind(this);
        this.createJanjiTemuHandler = this.createJanjiTemuHandler.bind(this);
        this.updateStatusJanjiTemuHandler = this.updateStatusJanjiTemuHandler.bind(this);
        this.deleteJanjiTemuHandler = this.deleteJanjiTemuHandler.bind(this);
    }

    // Get all janji temu records
    async getAllJanjiTemuHandler(request, h) {
        try {
            const data = await this._service.getAll();
            return {
                status: 'success',
                data: {
                    janjiTemu: data,
                },
            };
        } catch (error) {
            return this._handleServerError(h, error);
        }
    }

    // Create new janji temu
    async createJanjiTemuHandler(request, h) {
        try {
            this._validator.validateCreatePayload(request.payload);
            const { nrp, status_id, tipe_konsultasi, jadwal_utama_tanggal, jadwal_utama_jam_mulai, jadwal_utama_jam_selesai, jadwal_alternatif_tanggal, jadwal_alternatif_jam_mulai, jadwal_alternatif_jam_selesai } = request.payload;

            const createdBy = request.auth.credentials.jwt.user.id; 

            const result = await this._service.create({
                nrp, status_id, tipe_konsultasi, jadwal_utama_tanggal, jadwal_utama_jam_mulai, jadwal_utama_jam_selesai, jadwal_alternatif_tanggal, jadwal_alternatif_jam_mulai, jadwal_alternatif_jam_selesai, created_by: createdBy,
            });

            const response = h.response({
                status: 'success',
                message: 'Janji temu berhasil dibuat',
                data: { janjiTemu: result },
            });
            response.code(201); // Created HTTP status code
            return response;
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Update status of janji temu
    async updateStatusJanjiTemuHandler(request, h) {
        try {
            const { id } = request.params;
            this._validator.validateUpdatePayload(request.payload);
            const { status_id } = request.payload;

            const updatedBy = request.auth.credentials.jwt.user.id;

            const updatedJanjiTemu = await this._service.updateStatus(id, { status_id, updated_by: updatedBy });

            return {
                status: 'success',
                message: 'Status janji temu berhasil diperbarui',
                data: { janjiTemu: updatedJanjiTemu },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Soft delete janji temu
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

    // Error handling for ClientError
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

    // Error handling for other errors
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

module.exports = JanjiTemuHandler;
