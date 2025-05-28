const ClientError = require('../../exceptions/ClientError');
const NotFoundError = require('../../exceptions/NotFoundError');
const Boom = require('@hapi/boom');

class MahasiswaHandler {
    constructor(service, statusVerifikasiService, userService, fileStorageService, validator, emailVerificationService, mailSender) {
        this._service = service;
        this._statusVerifikasiService = statusVerifikasiService;
        this._userService = userService;
        this._fileStorageService = fileStorageService;
        this._validator = validator;
        this._emailVerificationService = emailVerificationService;
        this._mailSender = mailSender;

        this.getAllMahasiswaHandler = this.getAllMahasiswaHandler.bind(this);
        this.getMahasiswaByIdHandler = this.getMahasiswaByIdHandler.bind(this);
        this.getMahasiswaByNrpHandler = this.getMahasiswaByNrpHandler.bind(this);
        this.getOwnMahasiswaHandler = this.getOwnMahasiswaHandler.bind(this);
        this.postMahasiswaHandler = this.postMahasiswaHandler.bind(this);
        this.verifyMahasiswaHandler = this.verifyMahasiswaHandler.bind(this);
        this.requestReVerificationHandler = this.requestReVerificationHandler.bind(this);
        this.updateMahasiswaHandler = this.updateMahasiswaHandler.bind(this);
        this.deleteMahasiswaHandler = this.deleteMahasiswaHandler.bind(this);
        this.uploadKtmHandler = this.uploadKtmHandler.bind(this);
    }

    async getAllMahasiswaHandler(request, h) {
        try {
            const data = await this._service.getAll();
            return {
                status: 'success',
                data: { mahasiswa: data },
            };
        } catch (error) {
            return this._handleServerError(h, error);
        }
    }

    async getMahasiswaByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const data = await this._service.getById(id);
            return {
                status: 'success',
                data: { mahasiswa: data },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async getMahasiswaByNrpHandler(request, h) {
        try {
            const { nrp } = request.params;
            const data = await this._service.getByNrp(nrp);
            return {
                status: 'success',
                data: { mahasiswa: data },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async getOwnMahasiswaHandler(request, h) {
        try {
            const userId = request.auth.credentials.jwt.user.id;
            const mahasiswa = await this._service.getByUserId(userId);

            if (!mahasiswa) {
                throw new NotFoundError('Profil mahasiswa tidak ditemukan');
            }

            return {
                status: 'success',
                data: { mahasiswa },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async postMahasiswaHandler(request, h) {
        try {
            const { payload } = request;

            const {
                email,
                phoneNumber,
                password,
                roleId,
                nrp,
                nama_lengkap,
                program_studi_id,
                tanggal_lahir,
                jenis_kelamin,
                status_verifikasi_id,
            } = payload;

            const file = payload.ktm_url;
            const { url: ktmUrl } = await this._fileStorageService.saveKtmFile(file);

            const dataToValidate = {
                email, phoneNumber, password, roleId,
                nrp, nama_lengkap, program_studi_id,
                tanggal_lahir, jenis_kelamin, ktm_url: ktmUrl,
                status_verifikasi_id,
            };

            this._validator.validateCreatePayload(dataToValidate);

            // Buat akun user
            const userId = await this._userService.addUser({
                email,
                phoneNumber,
                password,
                isVerified: false,
                roleId,
            });

            // Kirim verifikasi email
            const verificationToken = await this._emailVerificationService.generateToken(userId);
            await this._mailSender.sendVerificationEmail(email, verificationToken);

            // Buat entri mahasiswa
            const mahasiswa = await this._service.create({
                nrp,
                nama_lengkap,
                program_studi_id,
                tanggal_lahir,
                jenis_kelamin,
                ktm_url: ktmUrl,
                user_id: userId,
                status_verifikasi_id,
            });

            return h.response({
                status: 'success',
                message: 'Registration completed successfully. Please verify your email to activate your account.',
                data: { mahasiswa },
            }).code(201);
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async verifyMahasiswaHandler(request, h) {
        try {
            const { id } = request.params;
            const { payload } = request;
            const verifiedBy = request.auth.credentials.jwt.user.id;

            this._validator.validateVerifyPayload(payload);

            const result = await this._service.verifyMahasiswa(id, {
                status_verifikasi_id: payload.status_verifikasi_id,
                catatan_verifikasi: payload.catatan_verifikasi,
                verified_by: verifiedBy,
            });

            return {
                status: 'success',
                message: 'Mahasiswa verification status updated successfully',
                data: { mahasiswa: result },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async requestReVerificationHandler(request, h) {
        try {
            const { id } = request.params;
            const payload = request.payload;
            const userId = request.auth.credentials.jwt.user.id;

            const mahasiswa = await this._service.getById(id);
            if (!mahasiswa || mahasiswa.user_id !== userId) {
                throw Boom.forbidden('Tidak bisa mengakses data milik pengguna lain');
            }

            let ktmUrl = payload.ktm_url;
            if (payload.ktm_url?.hapi) {
                const uploaded = await this._fileStorageService.saveKtmFile(payload.ktm_url);
                ktmUrl = uploaded.url;
            }

            const statusVerifikasi = await this._statusVerifikasiService.getByKode('verifikasi_ulang');
            const statusVerifikasiId = statusVerifikasi.id;

            const dataToValidate = {
                ...payload,
                ktm_url: ktmUrl,
                status_verifikasi_id: statusVerifikasiId,
                updated_by: userId,
            };

            this._validator.validateUpdatePayload(dataToValidate);

            const updatedMahasiswa = await this._service.requestReVerification(id, dataToValidate);

            return h.response({
                status: 'success',
                message: 'Pengajuan verifikasi ulang berhasil dikirim.',
                data: { mahasiswa: updatedMahasiswa },
            }).code(200);
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async updateMahasiswaHandler(request, h) {
        try {
            const { id } = request.params;
            const userId = request.auth.credentials.jwt.user.id;
            const payload = request.payload;

            const mahasiswa = await this._service.getById(id);
            if (!mahasiswa || mahasiswa.user_id !== userId) {
                throw Boom.forbidden('Tidak bisa mengakses data milik pengguna lain');
            }

            let ktmUrl = payload.ktm_url;
            if (payload.ktm_url?.hapi) {
                const uploaded = await this._fileStorageService.saveKtmFile(payload.ktm_url);
                ktmUrl = uploaded.url;
            }

            const dataToValidate = {
                ...payload,
                ktm_url: ktmUrl,
                updated_by: userId,
            };

            this._validator.validateUpdatePayload(dataToValidate);

            const updatedMahasiswa = await this._service.update(id, dataToValidate);

            return {
                status: 'success',
                message: 'Mahasiswa successfully updated',
                data: { mahasiswa: updatedMahasiswa },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async deleteMahasiswaHandler(request, h) {
        try {
            const { id } = request.params;
            const deletedBy = request.auth.credentials.jwt.user.id;

            const mahasiswa = await this._service.getById(id);
            const userId = mahasiswa.user_id;

            const result = await this._service.softDelete(id, deletedBy);
            await this._userService.deleteUser(userId, deletedBy);

            return {
                status: 'success',
                message: 'Mahasiswa successfully deleted',
                data: { mahasiswa: result },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async uploadKtmHandler(request, h) {
        try {
            const file = request.payload.file;
            const savedFile = await this._fileStorageService.saveKtmFile(file);
            return h.response(savedFile).code(201);
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

module.exports = MahasiswaHandler;
