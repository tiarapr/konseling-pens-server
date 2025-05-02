const ClientError = require('../../exceptions/ClientError');

class StatusHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        // Bind methods to ensure correct 'this' context
        this.getAllStatusHandler = this.getAllStatusHandler.bind(this);
        this.getStatusByIdHandler = this.getStatusByIdHandler.bind(this);
        this.postStatusHandler = this.postStatusHandler.bind(this);
        this.updateStatusHandler = this.updateStatusHandler.bind(this);
        this.deleteStatusHandler = this.deleteStatusHandler.bind(this);
    }

    // Get all status records
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

    // Get status by ID
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

    // Create new status
    async postStatusHandler(request, h) {
        try {
            this._validator.validateCreatePayload(request.payload);
            const { name, tipe_status_id } = request.payload;

            const createdBy = request.auth.credentials.jwt.user.id;

            const result = await this._service.create({ name, tipe_status_id, created_by: createdBy });

            const response = h.response({
                status: 'success',
                message: 'Status successfully created',
                data: {
                    status: result,
                },
            });
            response.code(201); // HTTP status code for created
            return response;
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Update status by ID
    async updateStatusHandler(request, h) {
        try {
            const { id } = request.params;
            this._validator.validateUpdatePayload(request.payload);
            const { name, tipe_status_id } = request.payload;

            const updatedBy = request.auth.credentials.jwt.user.id;

            const result = await this._service.update(id, { name, tipe_status_id, updated_by: updatedBy });

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

    // Soft delete status by ID
    async deleteStatusHandler(request, h) {
        try {
            const { id } = request.params;
            
            const deletedBy = request.auth.credentials.jwt.user.id;

            const result = await this._service.softDelete(id, deletedBy);

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

module.exports = StatusHandler;
