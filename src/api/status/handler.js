const ClientError = require('../../exceptions/ClientError');

class StatusHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.getAllStatusHandler = this.getAllStatusHandler.bind(this);
        this.getStatusByIdHandler = this.getStatusByIdHandler.bind(this);
        this.postStatusHandler = this.postStatusHandler.bind(this);
        this.updateStatusHandler = this.updateStatusHandler.bind(this);
        this.deleteStatusHandler = this.deleteStatusHandler.bind(this);
    }

    async getAllStatusHandler(request, h) {
        try {
            const data = await this._service.getAll();
            return {
                status: 'success',
                data: {
                    status: data,
                },
            };
        } catch (error) {
            return this._handleServerError(h, error);
        }
    }

    async getStatusByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const data = await this._service.getById(id);
            return {
                status: 'success',
                data: {
                    status: data,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async postStatusHandler(request, h) {
        try {
            this._validator.validateCreatePayload(request.payload);
            const { kode_status, label, warna, urutan, is_active } = request.payload;

            const result = await this._service.create({
                kode_status,
                label,
                warna,
                urutan,
                is_active,
            });

            const response = h.response({
                status: 'success',
                message: 'Status successfully created',
                data: {
                    status: result,
                },
            });
            response.code(201);
            return response;
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async updateStatusHandler(request, h) {
        try {
            const { id } = request.params;
            this._validator.validateUpdatePayload(request.payload);
            const { kode_status, label, warna, urutan, is_active } = request.payload;

            const result = await this._service.update(id, {
                kode_status,
                label,
                warna,
                urutan,
                is_active,
            });

            return {
                status: 'success',
                message: 'Status successfully updated',
                data: {
                    status: result,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async deleteStatusHandler(request, h) {
        try {
            const { id } = request.params;

            const result = await this._service.delete(id); // assuming hard delete as per service

            return {
                status: 'success',
                message: 'Status successfully deleted',
                data: {
                    status: result,
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

module.exports = StatusHandler;
