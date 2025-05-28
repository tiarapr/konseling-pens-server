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

    async getAll() {
        const query = {
            text: `
        SELECT 
          jt.id,
          jt.nomor_tiket,
          m.nama_lengkap AS nama_mahasiswa,
          jt.nrp,
          jt.status,
          jt.tipe_konsultasi,
          jt.jadwal_utama_tanggal,
          jt.jadwal_utama_jam_mulai,
          jt.jadwal_utama_jam_selesai,
          jt.jadwal_alternatif_tanggal,
          jt.jadwal_alternatif_jam_mulai,
          jt.jadwal_alternatif_jam_selesai,
          jt.tanggal_pengajuan,
          jt.status_changed_at,
          jt.status_changed_by,
          jt.created_by,
          jt.updated_by,
          jt.updated_at,
          jt.deleted_by,
          jt.deleted_at,
          kp.nama_lengkap AS nama_konselor
        FROM janji_temu jt
        JOIN mahasiswa m ON jt.nrp = m.nrp
        LEFT JOIN konselor_profil kp ON jt.preferensi_konselor_id = kp.id
        WHERE jt.deleted_at IS NULL
        ORDER BY jt.tanggal_pengajuan DESC
      `,
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    async getById(id) {
        const query = {
            text: `
        SELECT 
          jt.id,
          jt.nomor_tiket,
          m.nama_lengkap AS nama_mahasiswa,
          jt.nrp,
          jt.status,
          jt.tipe_konsultasi,
          jt.jadwal_utama_tanggal,
          jt.jadwal_utama_jam_mulai,
          jt.jadwal_utama_jam_selesai,
          jt.jadwal_alternatif_tanggal,
          jt.jadwal_alternatif_jam_mulai,
          jt.jadwal_alternatif_jam_selesai,
          jt.tanggal_pengajuan,
          jt.status_changed_at,
          jt.status_changed_by,
          jt.created_by,
          jt.updated_by,
          jt.updated_at,
          jt.deleted_by,
          jt.deleted_at,
          jt.alasan_penolakan,
          kp.nama_lengkap AS nama_konselor
        FROM janji_temu jt
        JOIN mahasiswa m ON jt.nrp = m.nrp
        LEFT JOIN konselor_profil kp ON jt.preferensi_konselor_id = kp.id
        WHERE jt.id = $1 AND jt.deleted_at IS NULL
      `,
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError("Janji temu tidak ditemukan");
        }

        return result.rows[0];
    }

    async getByNrp(nrp) {
        const result = await this._pool.query(
            'SELECT * FROM janji_temu WHERE nrp = $1 AND is_deleted = false ORDER BY created_at DESC',
            [nrp]
        );
        return result.rows;
    }

    async create(payload) {
        const {
            nrp,
            tipe_konsultasi,
            preferensi_konselor_id,
            jadwal_utama_tanggal,
            jadwal_utama_jam_mulai,
            jadwal_utama_jam_selesai,
            jadwal_alternatif_tanggal,
            jadwal_alternatif_jam_mulai,
            jadwal_alternatif_jam_selesai,
            created_by,
        } = payload;

        const nomor_tiket = generateUltraSafeTicketNumber();
        const tanggal_pengajuan = new Date();

        const query = {
            text: `
        INSERT INTO janji_temu (
          nomor_tiket, nrp, tipe_konsultasi, preferensi_konselor_id,
          jadwal_utama_tanggal, jadwal_utama_jam_mulai, jadwal_utama_jam_selesai,
          jadwal_alternatif_tanggal, jadwal_alternatif_jam_mulai, jadwal_alternatif_jam_selesai,
          tanggal_pengajuan, status, created_by
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7,
          $8, $9, $10,
          $11, 'menunggu_konfirmasi', $12
        ) RETURNING id, nomor_tiket
      `,
            values: [
                nomor_tiket, nrp, tipe_konsultasi, preferensi_konselor_id,
                jadwal_utama_tanggal, jadwal_utama_jam_mulai, jadwal_utama_jam_selesai,
                jadwal_alternatif_tanggal, jadwal_alternatif_jam_mulai, jadwal_alternatif_jam_selesai,
                tanggal_pengajuan, created_by
            ],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new InvariantError("Gagal membuat janji temu");
        }

        return result.rows[0];
    }

    async updateStatus(id, payload) {
        const { status, updated_by, alasan_penolakan } = payload;

        const query = {
            text: `
        UPDATE janji_temu
        SET status = $1,
            updated_by = $2,
            updated_at = CURRENT_TIMESTAMP,
            status_changed_at = CURRENT_TIMESTAMP,
            status_changed_by = $2,
            alasan_penolakan = $3
        WHERE id = $4 AND deleted_at IS NULL
        RETURNING id
      `,
            values: [status, updated_by, alasan_penolakan || null, id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError("Janji temu tidak ditemukan untuk update status");
        }

        return result.rows[0].id;
    }

    async softDelete(id, deleted_by) {
        const query = {
            text: `
        UPDATE janji_temu
        SET deleted_at = CURRENT_TIMESTAMP,
            deleted_by = $1
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING id
      `,
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
