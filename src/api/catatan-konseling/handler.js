const ClientError = require('../../exceptions/ClientError');

class CatatanKonselingHandler {
    constructor(service, konselingTopikService, validator) {
        this._service = service;
        this._konselingTopikService = konselingTopikService;
        this._validator = validator;

        // Bind methods
        this.createCatatanKonselingHandler = this.createCatatanKonselingHandler.bind(this);
        this.getAllCatatanKonselingHandler = this.getAllCatatanKonselingHandler.bind(this);
        this.getByKonselingIdHandler = this.getByKonselingIdHandler.bind(this);
        this.getCatatanKonselingByIdHandler = this.getCatatanKonselingByIdHandler.bind(this);
        this.updateCatatanKonselingHandler = this.updateCatatanKonselingHandler.bind(this);
        this.deleteCatatanKonselingHandler = this.deleteCatatanKonselingHandler.bind(this);
    }

    // Create new Catatan Konseling
    async createCatatanKonselingHandler(request, h) {
        try {
            this._validator.validateCreatePayload(request.payload);
            const {
                konseling_id, deskripsi_masalah, usaha, kendala, pencapaian,
                diagnosis, intervensi, tindak_lanjut, konseling_lanjutan, topik_ids // topik_ids is an array
            } = request.payload;

            const createdBy = request.auth.credentials.jwt.user.id;

            // Simpan catatan konseling
            const result = await this._service.create({
                konseling_id, deskripsi_masalah, usaha, kendala, pencapaian,
                diagnosis, intervensi, tindak_lanjut, konseling_lanjutan,
                created_by: createdBy,
            });

            // Simpan konseling-topik jika ada
            if (Array.isArray(topik_ids) && topik_ids.length > 0) {
                const topikInsertPromises = topik_ids.map((topik_id) =>
                    this._konselingTopikService.create({ konseling_id, topik_id, created_by: createdBy })
                );
                await Promise.all(topikInsertPromises);
            }

            const response = h.response({
                status: 'success',
                message: 'Catatan Konseling successfully created',
                data: { catatan_konseling: result },
            });
            response.code(201);
            return response;
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Get all Catatan Konseling (tanpa filter)
    async getAllCatatanKonselingHandler(request, h) {
        try {
            const data = await this._service.getAll();
            return {
                status: 'success',
                data: { catatan_konseling: data },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Get all Catatan Konseling by Konseling ID
    async getByKonselingIdHandler(request, h) {
        try {
            const { konseling_id } = request.params;
            const data = await this._service.getByKonselingId(konseling_id);

            return {
                status: 'success',
                data: { catatan_konseling: data },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Get Catatan Konseling by ID
    async getCatatanKonselingByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const data = await this._service.getById(id);

            return {
                status: 'success',
                data: { catatan_konseling: data },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Update Catatan Konseling
    async updateCatatanKonselingHandler(request, h) {
        try {
            const { id } = request.params;
            this._validator.validateUpdatePayload(request.payload);

            const {
                deskripsi_masalah, usaha, kendala, pencapaian, diagnosis,
                intervensi, tindak_lanjut, konseling_lanjutan,
                topik_ids // <- tambahkan ini
            } = request.payload;

            const updatedBy = request.auth.credentials.jwt.user.id;

            // 1. Update catatan konseling
            const updatedCatatanKonseling = await this._service.update(id, {
                deskripsi_masalah, usaha, kendala, pencapaian, diagnosis,
                intervensi, tindak_lanjut, konseling_lanjutan, updated_by: updatedBy,
            });

            // 2. Ambil data catatan untuk ambil konseling_id
            const catatan = await this._service.getById(id);
            const konseling_id = catatan.konseling_id;

            // 3. Hapus topik lama
            const existingTopiks = await this._konselingTopikService.getAllByKonselingId(konseling_id);
            const deletePromises = existingTopiks.map((relasi) =>
                this._konselingTopikService.delete(relasi.id, updatedBy)
            );
            await Promise.all(deletePromises);

            // 4. Tambahkan topik baru
            if (Array.isArray(topik_ids) && topik_ids.length > 0) {
                const insertPromises = topik_ids.map((topik_id) =>
                    this._konselingTopikService.create({ konseling_id, topik_id, created_by: updatedBy })
                );
                await Promise.all(insertPromises);
            }

            return {
                status: 'success',
                message: 'Catatan Konseling successfully updated',
                data: { catatan_konseling: updatedCatatanKonseling },
            };
        } catch (error) {
            return this._handleError(h, error);
        }
    }

    // Soft delete Catatan Konseling
    async deleteCatatanKonselingHandler(request, h) {
        try {
            const { id } = request.params;

            const deletedBy = request.auth.credentials.jwt.user.id;

            const result = await this._service.delete(id, deletedBy);

            return {
                status: 'success',
                message: 'Catatan Konseling successfully deleted',
                data: { catatan_konseling: result },
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

module.exports = CatatanKonselingHandler;
