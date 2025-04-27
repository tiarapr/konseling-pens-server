const ClientError = require('../../exceptions/ClientError');

class ProgramStudiHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.getAllProgramStudiHandler = this.getAllProgramStudiHandler.bind(this);
        this.getProgramStudiByIdHandler = this.getProgramStudiByIdHandler.bind(this);
        this.getProgramStudiByDepartementHandler = this.getProgramStudiByDepartementHandler.bind(this);
        this.postProgramStudiHandler = this.postProgramStudiHandler.bind(this);
        this.updateProgramStudiHandler = this.updateProgramStudiHandler.bind(this);
        this.deleteProgramStudiHandler = this.deleteProgramStudiHandler.bind(this);
    }

    async getAllProgramStudiHandler(request, h) {
        try {
            const data = await this._service.getAll();
            return {
                status: 'success',
                data: {
                    programStudi: data,
                },
            };
        } catch (error) {
            return this._handleServerError(h, error);
        }
    }

    async getProgramStudiByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const data = await this._service.getById(id);
            return {
                status: 'success',
                data: {
                    programStudi: data,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async getProgramStudiByDepartementHandler(request, h) {
        try {
            const { departementId } = request.params;
            const data = await this._service.getByDepartement(departementId);
            return {
                status: 'success',
                data: {
                    programStudi: data,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async postProgramStudiHandler(request, h) {
        try {
            this._validator.validateCreatePayload(request.payload);
            const { jenjang, nama_program_studi, departement_id, created_by } = request.payload;

            const result = await this._service.create({
                jenjang,
                nama_program_studi,
                departement_id,
                created_by,
            });

            const response = h.response({
                status: 'success',
                message: 'Program studi berhasil ditambahkan',
                data: {
                    programStudi: result,
                },
            });
            response.code(201);
            return response;
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async updateProgramStudiHandler(request, h) {
        try {
            const { id } = request.params;
            this._validator.validateUpdatePayload(request.payload);
            const { jenjang, nama_program_studi, departement_id, updated_by } = request.payload;

            const result = await this._service.update(id, {
                jenjang,
                nama_program_studi,
                departement_id,
                updated_by,
            });

            return {
                status: 'success',
                message: 'Program studi berhasil diperbarui',
                data: {
                    programStudi: result,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async deleteProgramStudiHandler(request, h) {
        try {
            const { id } = request.params;
            const { deleted_by } = request.payload;

            const result = await this._service.softDelete(id, deleted_by);

            return {
                status: 'success',
                message: 'Program studi berhasil dihapus',
                data: {
                    programStudi: result,
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

module.exports = ProgramStudiHandler;
