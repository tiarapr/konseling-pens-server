const ClientError = require('../../exceptions/ClientError');

class TopikHandler {
    constructor(service) {
        this._service = service;

        // Binding methods
        this.createTopikHandler = this.createTopikHandler.bind(this);
        this.getAllTopikHandler = this.getAllTopikHandler.bind(this);
        this.getTopikByIdHandler = this.getTopikByIdHandler.bind(this);
        this.updateTopikHandler = this.updateTopikHandler.bind(this);
        this.deleteTopikHandler = this.deleteTopikHandler.bind(this);
    }

    // Create a new topik
    async createTopikHandler(request, h) {
        try {
            this._validator.validateCreatePayload(request.payload);
            const { name, created_by } = request.payload;
            const result = await this._service.create({ name, created_by });

            return {
                status: 'success',
                message: 'Topik berhasil dibuat',
                data: {
                    topik: result,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Get all topik
    async getAllTopikHandler(request, h) {
        try {
            const data = await this._service.getAll();

            return {
                status: 'success',
                data: {
                    topik: data,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Get topik by ID
    async getTopikByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const data = await this._service.getById(id);

            return {
                status: 'success',
                data: {
                    topik: data,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Update topik by ID
    async updateTopikHandler(request, h) {
        try {
            const { id } = request.params;
            this._validator.validateUpdatePayload(request.payload);
            const { name, updated_by } = request.payload;

            const updatedTopik = await this._service.update(id, { name, updated_by });

            return {
                status: 'success',
                message: 'Topik berhasil diperbarui',
                data: {
                    topik: updatedTopik,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Soft delete topik by ID
    async deleteTopikHandler(request, h) {
        try {
            const { id } = request.params;
            const { deleted_by } = request.payload;

            const deletedTopik = await this._service.softDelete(id, deleted_by);

            return {
                status: 'success',
                message: 'Topik berhasil dihapus',
                data: {
                    topik: deletedTopik,
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

module.exports = TopikHandler;
