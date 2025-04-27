const ClientError = require('../../exceptions/ClientError');

class CatatanKonselingHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        // Bind methods
        this.createCatatanKonselingHandler = this.createCatatanKonselingHandler.bind(this);
        this.getAllCatatanKonselingHandler = this.getAllCatatanKonselingHandler.bind(this);
        this.getCatatanKonselingByIdHandler = this.getCatatanKonselingByIdHandler.bind(this);
        this.updateCatatanKonselingHandler = this.updateCatatanKonselingHandler.bind(this);
        this.deleteCatatanKonselingHandler = this.deleteCatatanKonselingHandler.bind(this);
    }

    // Create new Catatan Konseling
    async createCatatanKonselingHandler(request, h) {
        try {
            this._validator.validateCreatePayload(request.payload);
            const { konseling_id, deskripsi_masalah, usaha, kendala, pencapaian, diagnosis, intervensi, tindak_lanjut, konseling_lanjutan, created_by } = request.payload;

            const result = await this._service.create({ konseling_id, deskripsi_masalah, usaha, kendala, pencapaian, diagnosis, intervensi, tindak_lanjut, konseling_lanjutan, created_by });

            const response = h.response({
                status: 'success',
                message: 'Catatan Konseling successfully created',
                data: { catatan_konseling: result },
            });
            response.code(201); // HTTP status code for created
            return response;
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Get all Catatan Konseling by Konseling ID
    async getAllCatatanKonselingHandler(request, h) {
        try {
            const { konseling_id } = request.params;
            const data = await this._service.getAllByKonselingId(konseling_id);

            return {
                status: 'success',
                data: { catatan_konseling: data },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Get Catatan Konseling by ID
    async getCatatanKonselingByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const data = await this._service.getById(id);

            return {
                status: 'success',
                data: { catatan_konseling: data },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Update Catatan Konseling
    async updateCatatanKonselingHandler(request, h) {
        try {
            const { id } = request.params;
            this._validator.validateUpdatePayload(request.payload);
            const { deskripsi_masalah, usaha, kendala, pencapaian, diagnosis, intervensi, tindak_lanjut, konseling_lanjutan, updated_by } = request.payload;

            const updatedCatatanKonseling = await this._service.update(id, { deskripsi_masalah, usaha, kendala, pencapaian, diagnosis, intervensi, tindak_lanjut, konseling_lanjutan, updated_by });

            return {
                status: 'success',
                message: 'Catatan Konseling successfully updated',
                data: { catatan_konseling: updatedCatatanKonseling },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Soft delete Catatan Konseling
    async deleteCatatanKonselingHandler(request, h) {
        try {
            const { id } = request.params;
            const { deleted_by } = request.payload;

            const result = await this._service.delete(id, deleted_by);

            return {
                status: 'success',
                message: 'Catatan Konseling successfully deleted',
                data: { catatan_konseling: result },
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

module.exports = CatatanKonselingHandler;
