const ClientError = require('../../exceptions/ClientError');

class CatatanKonselingHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.createCatatanKonselingHandler = this.createCatatanKonselingHandler.bind(this);
        this.getAllCatatanKonselingHandler = this.getAllCatatanKonselingHandler.bind(this);
        this.getByKonselingIdHandler = this.getByKonselingIdHandler.bind(this);
        this.getOwnCatatanKonselingByKonselingIdHandler = this.getOwnCatatanKonselingByKonselingIdHandler.bind(this);
        this.getCatatanKonselingByIdHandler = this.getCatatanKonselingByIdHandler.bind(this);
        this.updateCatatanKonselingHandler = this.updateCatatanKonselingHandler.bind(this);
        this.deleteCatatanKonselingHandler = this.deleteCatatanKonselingHandler.bind(this);
    }

    async createCatatanKonselingHandler(request, h) {
        try {
            this._validator.validateCreatePayload(request.payload);

            const {
                konseling_id, deskripsi_masalah, usaha, kendala,
                pencapaian, diagnosis, intervensi, tindak_lanjut,
                konseling_lanjutan,
            } = request.payload;

            const createdBy = request.auth.credentials.jwt.user.id;

            const result = await this._service.create({
                konseling_id,
                deskripsi_masalah,
                usaha,
                kendala,
                pencapaian,
                diagnosis,
                intervensi,
                tindak_lanjut,
                konseling_lanjutan,
                created_by: createdBy,
            });

            return h.response({
                status: 'success',
                message: 'Catatan Konseling successfully created',
                data: { catatan_konseling: result },
            }).code(201);

        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async getAllCatatanKonselingHandler(request, h) {
        try {
            const data = await this._service.getAll();
            return {
                status: 'success',
                data: { catatan_konseling: data },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async getByKonselingIdHandler(request, h) {
        try {
            const { konseling_id } = request.params;
            const data = await this._service.getByKonselingId(konseling_id);

            return {
                status: 'success',
                data: { catatan_konseling: data },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async getOwnCatatanKonselingByKonselingIdHandler(request, h) {
        try {
            const { konseling_id } = request.params;
            const userId = request.auth.credentials.jwt.user.id;

            const isOwned = await this._service.isKonselingOwnedByUser(konseling_id, userId);
            if (!isOwned) {
                return h.response({
                    status: 'fail',
                    message: 'Anda tidak memiliki akses ke catatan konseling ini.',
                }).code(403);
            }

            const data = await this._service.getByKonselingId(konseling_id);
            return {
                status: 'success',
                data: { catatan_konseling: data },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

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

    async updateCatatanKonselingHandler(request, h) {
        try {
            const { id } = request.params;
            this._validator.validateUpdatePayload(request.payload);

            const {
                deskripsi_masalah, usaha, kendala, pencapaian,
                diagnosis, intervensi, tindak_lanjut, konseling_lanjutan,
            } = request.payload;

            const updatedBy = request.auth.credentials.jwt.user.id;

            const updatedId = await this._service.update(id, {
                deskripsi_masalah,
                usaha,
                kendala,
                pencapaian,
                diagnosis,
                intervensi,
                tindak_lanjut,
                konseling_lanjutan,
                updated_by: updatedBy,
            });

            return {
                status: 'success',
                message: 'Catatan Konseling successfully updated',
                data: { catatan_konseling: updatedId },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async deleteCatatanKonselingHandler(request, h) {
        try {
            const { id } = request.params;
            const deletedBy = request.auth.credentials.jwt.user.id;

            const result = await this._service.delete(id, deletedBy);

            return {
                status: 'success',
                message: 'Catatan Konseling successfully deleted',
                data: { catatan_konseling: result },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    _handleError(h, error) {
        if (error instanceof ClientError) {
            return h.response({
                status: 'fail',
                message: error.message,
            }).code(error.statusCode);
        }
        return this._handleServerError(h, error);
    }

    _handleServerError(h, error) {
        console.error(error);
        return h.response({
            status: 'error',
            message: 'Sorry, there was an error on the server.',
        }).code(500);
    }
}

module.exports = CatatanKonselingHandler;
