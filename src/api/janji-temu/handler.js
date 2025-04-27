const ClientError = require('../../exceptions/ClientError');

class JanjiTemuHandler {
    constructor(service) {
        this._service = service;

        // Bind methods to this
        this.createJanjiTemuHandler = this.createJanjiTemuHandler.bind(this);
        this.updateStatusJanjiTemuHandler = this.updateStatusJanjiTemuHandler.bind(this);
        this.deleteJanjiTemuHandler = this.deleteJanjiTemuHandler.bind(this);
    }

    // Create new janji temu
    async createJanjiTemuHandler(request, h) {
        try {
            this._validator.validateCreatePayload(request.payload);
            const { nrp, status_id, tipe_konsultasi, jadwal_utama_tanggal, jadwal_utama_jam_mulai, jadwal_utama_jam_selesai, jadwal_alternatif_tanggal, jadwal_alternatif_jam_mulai, jadwal_alternatif_jam_selesai, tanggal_pengajuan, created_by } = request.payload;

            const result = await this._service.create({
                nrp, status_id, tipe_konsultasi, jadwal_utama_tanggal, jadwal_utama_jam_mulai, jadwal_utama_jam_selesai, jadwal_alternatif_tanggal, jadwal_alternatif_jam_mulai, jadwal_alternatif_jam_selesai, tanggal_pengajuan, created_by
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
            const { status_id, updated_by } = request.payload;

            const updatedJanjiTemu = await this._service.updateStatus(id, { status_id, updated_by });

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
            const { deleted_by } = request.payload;

            const result = await this._service.softDelete(id, deleted_by);

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
