const ClientError = require('../../exceptions/ClientError');

class StatusVerifikasiHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.getAllStatusVerifikasiHandler = this.getAllStatusVerifikasiHandler.bind(this);
        this.getStatusVerifikasiByIdHandler = this.getStatusVerifikasiByIdHandler.bind(this);
        this.postStatusVerifikasiHandler = this.postStatusVerifikasiHandler.bind(this);
        this.updateStatusVerifikasiHandler = this.updateStatusVerifikasiHandler.bind(this);
        this.deleteStatusVerifikasiHandler = this.deleteStatusVerifikasiHandler.bind(this);
    }

    async getAllStatusVerifikasiHandler(request, h) {
        try {
            const data = await this._service.getAll();
            return {
                status: 'success',
                data: {
                    statusVerifikasi: data,
                },
            };
        } catch (error) {
            return this._handleServerError(h, error);
        }
    }

    async getStatusVerifikasiByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const data = await this._service.getById(id);
            return {
                status: 'success',
                data: {
                    statusVerifikasi: data,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async postStatusVerifikasiHandler(request, h) {
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
                message: 'Status Verifikasi successfully created',
                data: {
                    statusVerifikasi: result,
                },
            });
            response.code(201);
            return response;
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async updateStatusVerifikasiHandler(request, h) {
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
                message: 'Status Verifikasi successfully updated',
                data: {
                    statusVerifikasi: result,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async deleteStatusVerifikasiHandler(request, h) {
        try {
            const { id } = request.params;

            const result = await this._service.delete(id); 

            return {
                status: 'success',
                message: 'Status Verifikasi successfully deleted',
                data: {
                    statusVerifikasi: result,
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

module.exports = StatusVerifikasiHandler;
