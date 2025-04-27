const ClientError = require('../../exceptions/ClientError');

class MahasiswaHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        // Bind methods
        this.getAllMahasiswaHandler = this.getAllMahasiswaHandler.bind(this);
        this.getMahasiswaByIdHandler = this.getMahasiswaByIdHandler.bind(this);
        this.postMahasiswaHandler = this.postMahasiswaHandler.bind(this);
        this.updateMahasiswaHandler = this.updateMahasiswaHandler.bind(this);
        this.deleteMahasiswaHandler = this.deleteMahasiswaHandler.bind(this);
        this.uploadKtmHandler = this.uploadKtmHandler.bind(this);
    }

    // Get all mahasiswa records
    async getAllMahasiswaHandler(request, h) {
        try {
            const data = await this._service.getAll();
            return {
                status: 'success',
                data: {
                    mahasiswa: data,
                },
            };
        } catch (error) {
            return this._handleServerError(h, error);
        }
    }

    // Get mahasiswa by ID
    async getMahasiswaByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const data = await this._service.getById(id);
            return {
                status: 'success',
                data: {
                    mahasiswa: data,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Create new mahasiswa
    async postMahasiswaHandler(request, h) {
        try {
            this._validator.validateCreatePayload(request.payload);
            const { nrp, nama_lengkap, program_studi_id, tanggal_lahir, jenis_kelamin, no_telepon, ktm_url, user_id, status_id, created_by } = request.payload;

            const result = await this._service.create({ nrp, nama_lengkap, program_studi_id, tanggal_lahir, jenis_kelamin, no_telepon, ktm_url, user_id, status_id, created_by });

            const response = h.response({
                status: 'success',
                message: 'Mahasiswa successfully created',
                data: {
                    mahasiswa: result,
                },
            });
            response.code(201); // HTTP status code for created
            return response;
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Update mahasiswa by ID
    async updateMahasiswaHandler(request, h) {
        try {
            const { id } = request.params;
            this._validator.validateUpdatePayload(request.payload);
            const { nrp, nama_lengkap, program_studi_id, tanggal_lahir, jenis_kelamin, no_telepon, ktm_url, user_id, status_id, updated_by } = request.payload;

            const updatedMahasiswa = await this._service.update(id, {
                nrp,
                nama_lengkap,
                program_studi_id,
                tanggal_lahir,
                jenis_kelamin,
                no_telepon,
                ktm_url,
                user_id,
                status_id,
                updated_by
            });

            return {
                status: 'success',
                message: 'Mahasiswa successfully updated',
                data: {
                    mahasiswa: updatedMahasiswa,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Soft delete mahasiswa by ID
    async deleteMahasiswaHandler(request, h) {
        try {
            const { id } = request.params;
            const { deleted_by } = request.payload;

            const result = await this._service.softDelete(id, deleted_by);

            return {
                status: 'success',
                message: 'Mahasiswa successfully deleted',
                data: {
                    mahasiswa: result,
                },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Upload KTM file
    async uploadKtmHandler(request, h) {
        try {
            const file = request.payload.file;
            const savedFile = await this._service.saveKtmFile(file);
            return h.response(savedFile).code(201);
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

module.exports = MahasiswaHandler;
