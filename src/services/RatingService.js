const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class RatingService {
    constructor() {
        this._pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
    }

    async addRating({ konseling_id, rating, ulasan }) {
        const query = {
            text: `INSERT INTO rating (konseling_id, rating, ulasan)
             VALUES ($1, $2, $3)
             RETURNING *`,
            values: [konseling_id, rating, ulasan],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError("Failed to add rating.");
        }

        return result.rows[0];
    }

    async getAllRatings() {
        const query = {
            text: "SELECT * FROM rating ORDER BY created_at DESC",
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    async getRatingById(ratingId) {
        const query = {
            text: "SELECT * FROM rating WHERE id = $1",
            values: [ratingId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Rating not found.");
        }

        return result.rows[0];
    }
    
    async getRatingByKonselingId(konselingId) {
        const query = {
            text: "SELECT * FROM rating WHERE konseling_id = $1",
            values: [konselingId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Rating for the specified konseling ID not found.");
        }

        return result.rows[0];
    }

    async updateRating(ratingId, { rating, ulasan }) {
        const query = {
            text: `
        UPDATE rating 
        SET rating = $1, ulasan = $2
        WHERE id = $3
        RETURNING *`,
            values: [rating, ulasan, ratingId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Rating not found.");
        }

        return result.rows[0];
    }

    async deleteRating(ratingId) {
        const query = {
            text: "DELETE FROM rating WHERE id = $1 RETURNING *",
            values: [ratingId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Rating not found.");
        }
    }
}

module.exports = RatingService;
