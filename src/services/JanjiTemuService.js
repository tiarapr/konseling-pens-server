const crypto = require("crypto");
const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

function generateUltraSafeTicketNumber() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `TIKET-${date}-${random}`;
}

class JanjiTemuService {
    constructor() {
        this._pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
    }

    async create(payload) {
        const {
            nrp,
            status_id,
            tipe_konsultasi,
            jadwal_utama_tanggal,
            jadwal_utama_jam_mulai,
            jadwal_utama_jam_selesai,
            jadwal_alternatif_tanggal,
            jadwal_alternatif_jam_mulai,
            jadwal_alternatif_jam_selesai,
            tanggal_pengajuan,
            created_by,
        } = payload;

        const nomor_tiket = generateUltraSafeTicketNumber();

        const query = {
            text: `
                INSERT INTO janji_temu (
                    id, nomor_tiket, nrp, status_id, tipe_konsultasi,
                    jadwal_utama_tanggal, jadwal_utama_jam_mulai, jadwal_utama_jam_selesai,
                    jadwal_alternatif_tanggal, jadwal_alternatif_jam_mulai, jadwal_alternatif_jam_selesai,
                    tanggal_pengajuan, created_by
                ) VALUES (
                    gen_random_uuid(), $1, $2, $3, $4,
                    $5, $6, $7,
                    $8, $9, $10,
                    $11, $12
                )
                RETURNING id`,
            values: [
                nomor_tiket, nrp, status_id, tipe_konsultasi,
                jadwal_utama_tanggal, jadwal_utama_jam_mulai, jadwal_utama_jam_selesai,
                jadwal_alternatif_tanggal, jadwal_alternatif_jam_mulai, jadwal_alternatif_jam_selesai,
                tanggal_pengajuan, created_by,
            ],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError("Gagal menambahkan janji temu");
        }

        return {
            id: result.rows[0].id,
            nomor_tiket,
        };
    }

    async updateStatus(id, payload) {
        const { status_id, updated_by } = payload;

        const query = {
            text: `
                UPDATE janji_temu
                SET status_id = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $3 AND deleted_at IS NULL
                RETURNING id`,
            values: [status_id, updated_by, id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError("Gagal memperbarui janji temu. ID tidak ditemukan");
        }

        return result.rows[0].id;
    }

    async softDelete(id, deleted_by) {
        const query = {
            text: `
                UPDATE janji_temu
                SET deleted_at = CURRENT_TIMESTAMP, deleted_by = $1
                WHERE id = $2 AND deleted_at IS NULL
                RETURNING id`,
            values: [deleted_by, id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError("Janji temu tidak ditemukan atau sudah dihapus");
        }

        return result.rows[0].id;
    }
}

module.exports = JanjiTemuService;
