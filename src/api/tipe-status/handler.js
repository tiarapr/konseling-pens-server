const ClientError = require('../../exceptions/ClientError');

class TipeStatusHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.getAllTipeStatusHandler = this.getAllTipeStatusHandler.bind(this);
        this.getTipeStatusByIdHandler = this.getTipeStatusByIdHandler.bind(this);
        this.postTipeStatusHandler = this.postTipeStatusHandler.bind(this);
        this.updateTipeStatusHandler = this.updateTipeStatusHandler.bind(this);
        this.deleteTipeStatusHandler = this.deleteTipeStatusHandler.bind(this);
    }

    async getAllTipeStatusHandler(request, h) {
        try {
            const data = await this._service.getAll();
            return {
                status: 'success',
                data: {
                    tipeStatus: data,
                },
            };
        } catch (error) {
            return this._handleServerError(h, error);
        }
    }

    async getTipeStatusByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const data = await this._service.getById(id);
            return {
                status: 'success',
                data: {
                    tipeStatus: data,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async postTipeStatusHandler(request, h) {
        try {
            this._validator.validateTipeStatusPayload(request.payload);
            const { name } = request.payload;

            const createdBy = request.auth.credentials.jwt.user.id;

            const result = await this._service.create({ name, created_by: createdBy });

            const response = h.response({
                status: 'success',
                message: 'Tipe status berhasil ditambahkan',
                data: {
                    tipeStatus: result,
                },
            });
            response.code(201);
            return response;
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async updateTipeStatusHandler(request, h) {
        try {
            const { id } = request.params;
            this._validator.validateTipeStatusPayload(request.payload);
            const { name } = request.payload;

            const updatedBy = request.auth.credentials.jwt.user.id;

            const result = await this._service.update(id, { name, updated_by: updatedBy });

            return {
                status: 'success',
                message: 'Tipe status berhasil diperbarui',
                data: {
                    tipeStatus: result,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async deleteTipeStatusHandler(request, h) {
        try {
            const { id } = request.params;

            const deletedBy = request.auth.credentials.jwt.user.id;

            const result = await this._service.softDelete(id, deletedBy);

            return {
                status: 'success',
                message: 'Tipe status berhasil dihapus',
                data: {
                    tipeStatus: result,
                },
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
            message: 'Sorry, there was an error on the server.',
        });
        response.code(500);
        return response;
    }
}

module.exports = TipeStatusHandler;
