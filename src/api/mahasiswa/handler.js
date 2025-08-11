const ClientError = require('../../exceptions/ClientError');
const NotFoundError = require('../../exceptions/NotFoundError');
const Boom = require('@hapi/boom');

class MahasiswaHandler {
    constructor(service, statusVerifikasiService, userService, konselorProfileService, roleService, fileStorageService, validator, emailVerificationService, mailSender) {
        this._service = service;
        this._statusVerifikasiService = statusVerifikasiService;
        this._userService = userService;
        this._roleService = roleService;
        this._konselorProfileService = konselorProfileService;
        this._fileStorageService = fileStorageService;
        this._validator = validator;
        this._emailVerificationService = emailVerificationService;
        this._mailSender = mailSender;

        this.getAllMahasiswaHandler = this.getAllMahasiswaHandler.bind(this);
        this.getMahasiswaByIdHandler = this.getMahasiswaByIdHandler.bind(this);
        this.getMahasiswaByNrpHandler = this.getMahasiswaByNrpHandler.bind(this);
        this.getOwnMahasiswaHandler = this.getOwnMahasiswaHandler.bind(this);
        this.getMahasiswaWithJanjiTemuHandler = this.getMahasiswaWithJanjiTemuHandler.bind(this);
        this.getMahasiswaByKonselorIdHandler = this.getMahasiswaByKonselorIdHandler.bind(this);
        this.postMahasiswaHandler = this.postMahasiswaHandler.bind(this);
        this.verifyMahasiswaHandler = this.verifyMahasiswaHandler.bind(this);
        this.requestReVerificationHandler = this.requestReVerificationHandler.bind(this);
        this.updateMahasiswaHandler = this.updateMahasiswaHandler.bind(this);
        this.deleteMahasiswaHandler = this.deleteMahasiswaHandler.bind(this);
        this.uploadKtmHandler = this.uploadKtmHandler.bind(this);
        this.getRekamMedisByNrpHandler = this.getRekamMedisByNrpHandler.bind(this);
    }

    async postMahasiswaHandler(request, h) {
        const client = await this._service.getDatabaseClient();

        try {
            const { payload } = request;
            const { ktm_url: file, ...data } = payload;

            // Validasi data tanpa ktm_url (karena file)
            this._validator.validateCreatePayload(data);

            await client.query('BEGIN');

            // Simpan data user dan mahasiswa tanpa ktm_url dulu
            const role = await this._roleService.getRoleByName('mahasiswa');
            const userId = await this._userService.addUser(client, {
                email: data.email,
                phoneNumber: data.phoneNumber,
                password: data.password,
                isVerified: false,
                roleId: role.id,
            });

            const status = await this._statusVerifikasiService.getByKode('menunggu_verifikasi');
            const statusVerifikasiId = status.id;

            const mahasiswa = await this._service.create(client, {
                nrp: data.nrp,
                nama_lengkap: data.nama_lengkap,
                program_studi_id: data.program_studi_id,
                tanggal_lahir: data.tanggal_lahir,
                jenis_kelamin: data.jenis_kelamin,
                user_id: userId,
                status_verifikasi_id: statusVerifikasiId,
                ktm_url: 'dummy.jpg',
            });

            // Setelah data berhasil disimpan, upload file
            const { url: ktmUrl } = await this._fileStorageService.saveKtmFile(file);

            // Update mahasiswa record dengan URL file ktm_url
            await this._service.updateKtm(client, mahasiswa.id, ktmUrl);

            // Kirim email verifikasi
            const token = await this._emailVerificationService.generateToken(client, userId);
            await this._mailSender.sendVerificationEmail(data.email, token);

            await client.query('COMMIT');

            return h.response({
                status: 'success',
                message: 'Registrasi berhasil. Silakan cek email untuk verifikasi.',
                data: { mahasiswa },
            }).code(201);

        } catch (error) {
            await client.query('ROLLBACK').catch(() => { });
            return this._handleError(h, error);
        } finally {
            client.release();
        }
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

    async getMahasiswaWithJanjiTemuHandler(request, h) {
        try {
            const data = await this._service.getMahasiswaWithJanjiTemu();
            return {
                status: 'success',
                data: { mahasiswa: data },
            };
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

            // Cek apakah status baru adalah "terverifikasi"
            const statusVerifikasi = await this._statusVerifikasiService.getById(payload.status_verifikasi_id);
            const isTerverifikasi = statusVerifikasi.kode === 'terverifikasi';

            const updateData = {
                status_verifikasi_id: payload.status_verifikasi_id,
                // Jika status terverifikasi, set catatan menjadi null
                catatan_verifikasi: isTerverifikasi ? null : payload.catatan_verifikasi,
                verified_by: verifiedBy,
            };

            const result = await this._service.verifyMahasiswa(id, updateData);

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
            const userId = request.auth.credentials.jwt.user.id;

            const mahasiswa = await this._service.getById(id);
            if (!mahasiswa || mahasiswa.user_id !== userId) {
                throw Boom.forbidden('Tidak bisa mengakses data milik pengguna lain');
            }

            const statusVerifikasi = await this._statusVerifikasiService.getByKode('menunggu_peninjauan');
            const statusVerifikasiId = statusVerifikasi.id;

            const dataToValidate = {
                status_verifikasi_id: statusVerifikasiId,
                updated_by: userId,
            };

            this._validator.validateUpdatePayload(dataToValidate);

            const updatedMahasiswa = await this._service.requestReVerification(id, dataToValidate);

            return h.response({
                status: 'success',
                message: 'Permintaan tinjau ulang berhasil dikirim.',
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
                message: 'Mahasiswa berhasil diperbarui',
                data: { mahasiswa: updatedMahasiswa },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    async deleteMahasiswaHandler(request, h) {
        const client = await this._userService._pool.connect();

        try {
            const { id } = request.params;
            const requesterId = request.auth.credentials.jwt.user.id;

            // Ambil data mahasiswa untuk cek otorisasi
            const mahasiswa = await this._service.getById(id);
            if (!mahasiswa) {
                throw new NotFoundError('Mahasiswa tidak ditemukan');
            }

            const userId = mahasiswa.user_id;

            // Mulai transaksi
            await client.query('BEGIN');

            // Soft delete mahasiswa
            await this._service.softDelete(client, id, requesterId);

            // Soft delete user
            await this._userService.deleteUser(client, userId, requesterId);

            await client.query('COMMIT');

            return {
                status: 'success',
                message: 'Mahasiswa berhasil dihapus',
            };

        } catch (error) {
            await client.query('ROLLBACK');
            return this._handleError(h, error);
        } finally {
            client.release();
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

    async getMahasiswaByKonselorIdHandler(request, h) {
        try {
            const userId = request.auth.credentials.jwt.user.id;

            const konselor = await this._konselorProfileService.getByUserId(userId);
            if (!konselor) {
                throw new ClientError('Data konselor tidak ditemukan', 404);
            }

            const data = await this._service.getMahasiswaByKonselorId(konselor.id);
            return {
                status: 'success',
                data,
            };
        } catch (error) {
            return this._handleServerError(h, error);
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
            return this._handleServerError(h, error);
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
