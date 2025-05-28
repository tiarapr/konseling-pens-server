const ClientError = require('./../../exceptions/ClientError');

class RatingHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.addRatingHandler = this.addRatingHandler.bind(this);
        this.getAllRatingsHandler = this.getAllRatingsHandler.bind(this);
        this.getRatingByIdHandler = this.getRatingByIdHandler.bind(this);
        this.updateRatingHandler = this.updateRatingHandler.bind(this);
    }

    async addRatingHandler(request, h) {
        try {
            this._validator.validateAddRatingPayload(request.payload);

            const { konseling_id, rating, ulasan } = request.payload;
            const newRating = await this._service.addRating({ konseling_id, rating, ulasan });

            return h.response({
                status: 'success',
                message: 'Rating successfully added',
                data: { rating: newRating },
            }).code(201);
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    async getAllRatingsHandler(request, h) {
        try {
            const ratings = await this._service.getAllRatings();
            return {
                status: 'success',
                data: { ratings },
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    async getRatingByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const rating = await this._service.getRatingById(id);

            return {
                status: 'success',
                data: { rating },
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    async getRatingByKonselingIdHandler(request, h) {
        try {
            const { konselingId } = request.params;
            const rating = await this._ratingService.getRatingByKonselingId(konselingId);

            return {
                status: 'success',
                data: { rating },
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    async updateRatingHandler(request, h) {
        try {
            this._validator.validateUpdateRatingPayload(request.payload);

            const { id } = request.params;
            const { rating, ulasan } = request.payload;
            const updatedRating = await this._service.updateRating(id, { rating, ulasan });

            return h.response({
                status: 'success',
                message: 'Rating successfully updated',
                data: { rating: updatedRating },
            }).code(200);
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    _handleError(error, h) {
        if (error instanceof ClientError) {
            return h.response({
                status: 'fail',
                message: error.message,
            }).code(error.statusCode);
        }

        console.error(error);
        return h.response({
            status: 'error',
            message: 'Maaf, terjadi kegagalan pada server kami.',
        }).code(500);
    }
}

module.exports = RatingHandler;
