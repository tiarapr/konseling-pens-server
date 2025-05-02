const ClientError = require('../../exceptions/ClientError');
const NotFoundError = require('../../exceptions/NotFoundError');

class MahasiswaHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        // Bind methods
        this.getAllMahasiswaHandler = this.getAllMahasiswaHandler.bind(this);
        this.getMahasiswaByIdHandler = this.getMahasiswaByIdHandler.bind(this);
        this.getMahasiswaByNrpHandler = this.getMahasiswaByNrpHandler.bind(this);
        this.postMahasiswaHandler = this.postMahasiswaHandler.bind(this);
        this.updateMahasiswaHandler = this.updateMahasiswaHandler.bind(this);
        this.deleteMahasiswaHandler = this.deleteMahasiswaHandler.bind(this);
        this.uploadKtmHandler = this.uploadKtmHandler.bind(this);
        this.getRekamMedisByNrpHandler = this.getRekamMedisByNrpHandler.bind(this);
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

    // Get mahasiswa by NRP
    async getMahasiswaByNrpHandler(request, h) {
        try {
            const { nrp } = request.params;
            const data = await this._service.getByNrp(nrp);
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
            const payload = request.payload;

            // Ambil file KTM dari form-data
            const file = payload.ktm_url;

            // Simpan file KTM dan dapatkan URL-nya
            const { url: ktmUrl } = await this._service.saveKtmFile(file);

            // Validasi data lain (pastikan hanya data JSON yang divalidasi)
            this._validator.validateCreatePayload({
                nrp: payload.nrp,
                nama_lengkap: payload.nama_lengkap,
                program_studi_id: payload.program_studi_id,
                tanggal_lahir: payload.tanggal_lahir,
                jenis_kelamin: payload.jenis_kelamin,
                no_telepon: payload.no_telepon,
                ktm_url: ktmUrl, // validasi ktm_url hasil upload
                user_id: payload.user_id,
                status_id: payload.status_id,
                created_by: payload.created_by,
            });

            // Simpan data ke database
            const result = await this._service.create({
                nrp: payload.nrp,
                nama_lengkap: payload.nama_lengkap,
                program_studi_id: payload.program_studi_id,
                tanggal_lahir: payload.tanggal_lahir,
                jenis_kelamin: payload.jenis_kelamin,
                no_telepon: payload.no_telepon,
                ktm_url: ktmUrl,
                user_id: payload.user_id,
                status_id: payload.status_id,
                created_by: payload.created_by,
            });

            return h.response({
                status: 'success',
                message: 'Mahasiswa successfully created',
                data: {
                    mahasiswa: result,
                },
            }).code(201);
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Update mahasiswa by ID
    async updateMahasiswaHandler(request, h) {
        try {
            const { id } = request.params;
            const payload = request.payload;

            // Cek apakah file KTM baru dikirim
            let ktmUrl = payload.ktm_url;
            if (payload.ktm_url && payload.ktm_url.hapi) {
                // Kalau field ini file, maka upload file baru
                const uploaded = await this._service.saveKtmFile(payload.ktm_url);
                ktmUrl = uploaded.url;
            }

            // Validasi data update
            this._validator.validateUpdatePayload({
                nrp: payload.nrp,
                nama_lengkap: payload.nama_lengkap,
                program_studi_id: payload.program_studi_id,
                tanggal_lahir: payload.tanggal_lahir,
                jenis_kelamin: payload.jenis_kelamin,
                no_telepon: payload.no_telepon,
                ktm_url: ktmUrl,
                user_id: payload.user_id,
                status_id: payload.status_id,
                updated_by: payload.updated_by,
            });

            // Simpan ke database
            const updatedMahasiswa = await this._service.update(id, {
                nrp: payload.nrp,
                nama_lengkap: payload.nama_lengkap,
                program_studi_id: payload.program_studi_id,
                tanggal_lahir: payload.tanggal_lahir,
                jenis_kelamin: payload.jenis_kelamin,
                no_telepon: payload.no_telepon,
                ktm_url: ktmUrl,
                user_id: payload.user_id,
                status_id: payload.status_id,
                updated_by: payload.updated_by,
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

            const deletedBy = request.auth.credentials.jwt.user.id;

            const result = await this._service.softDelete(id, deletedBy);

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

    async getRekamMedisByNrpHandler(request, h) {
        const { nrp } = request.params;
    
        try {
            const data = await this._service.getRekamMedisByNrp(nrp);
    
            return {
                status: 'success',
                data,
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                return h.response({
                    status: 'fail',
                    message: error.message,
                }).code(404);
            }
    
            return this._handleServerError(h, error);
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
