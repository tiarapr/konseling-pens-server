const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class KonselingService {
  constructor() {
    this._pool = new Pool();
  }

  async create(payload) {
    const {
      janji_temu_id,
      tanggal_konseling,
      jam_mulai,
      jam_selesai,
      status_kehadiran,
      tanggal_konfirmasi,
      status_id,
      created_by,
    } = payload;

    const query = {
      text: `
        INSERT INTO konseling (
          janji_temu_id, tanggal_konseling, jam_mulai, jam_selesai,
          status_kehadiran, tanggal_konfirmasi, status_id, created_by
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8
        )
        RETURNING id`,
      values: [
        janji_temu_id, tanggal_konseling, jam_mulai, jam_selesai,
        status_kehadiran, tanggal_konfirmasi, status_id, created_by,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Gagal menambahkan konseling");
    }

    return result.rows[0].id;
  }

  async getAll() {
    const result = await this._pool.query(`
      SELECT * FROM konseling
      WHERE deleted_at IS NULL
      ORDER BY tanggal_konseling DESC, jam_mulai DESC
    `);
    return result.rows;
  }

  async getById(id) {
    const query = {
      text: `SELECT * FROM konseling WHERE id = $1 AND deleted_at IS NULL`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Konseling tidak ditemukan");
    }

    return result.rows[0];
  }

  async update(id, payload) {
    const {
      tanggal_konseling,
      jam_mulai,
      jam_selesai,
      status_kehadiran,
      tanggal_konfirmasi,
      status_id,
      updated_by,
    } = payload;

    const existing = await this.getById(id);

    const updatedTanggal = tanggal_konseling ?? existing.tanggal_konseling;
    const updatedJamMulai = jam_mulai ?? existing.jam_mulai;
    const updatedJamSelesai = jam_selesai ?? existing.jam_selesai;
    const updatedStatusKehadiran = status_kehadiran ?? existing.status_kehadiran;
    const updatedTanggalKonfirmasi = tanggal_konfirmasi ?? existing.tanggal_konfirmasi;
    const updatedStatusId = status_id ?? existing.status_id;
    const updatedUpdatedBy = updated_by ?? existing.updated_by;

    const query = {
      text: `
        UPDATE konseling
        SET
          tanggal_konseling = $1,
          jam_mulai = $2,
          jam_selesai = $3,
          status_kehadiran = $4,
          tanggal_konfirmasi = $5,
          status_id = $6,
          updated_by = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8 AND deleted_at IS NULL
        RETURNING id`,
      values: [
        updatedTanggal,
        updatedJamMulai,
        updatedJamSelesai,
        updatedStatusKehadiran,
        updatedTanggalKonfirmasi,
        updatedStatusId,
        updatedUpdatedBy,
        id,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui konseling. ID tidak ditemukan");
    }

    return result.rows[0].id;
  }

  async updateStatus(id, { status_id, updated_by }) {
    const query = {
      text: `
        UPDATE konseling
        SET
          status_id = $1,
          updated_by = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND deleted_at IS NULL
        RETURNING id
      `,
      values: [status_id, updated_by, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui status konseling. ID tidak ditemukan');
    }

    return result.rows[0].id;
  }

  async konfirmasiKehadiran(id, { status_kehadiran, tanggal_konfirmasi, status_id, updated_by }) {
    const existing = await this.getById(id);

    // Tentukan nilai status_id, jika status_kehadiran false, maka status_id harus diisi
    const updatedStatusId = status_kehadiran === false ? status_id : existing.status_id;

    const query = {
      text: `
        UPDATE konseling
        SET
          status_kehadiran = $1,
          tanggal_konfirmasi = $2,
          status_id = $3,
          updated_by = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 AND deleted_at IS NULL
        RETURNING id
      `,
      values: [
        status_kehadiran,
        tanggal_konfirmasi,
        updatedStatusId,
        updated_by,
        id,
      ],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal mengkonfirmasi kehadiran. ID tidak ditemukan');
    }

    return result.rows[0].id;
  }

  async softDelete(id, deleted_by) {
    const query = {
      text: `
        UPDATE konseling
        SET deleted_at = CURRENT_TIMESTAMP,
            deleted_by = $1
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING id`,
      values: [deleted_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Konseling tidak ditemukan atau sudah dihapus");
    }

    return result.rows[0].id;
  }
}

module.exports = KonselingService;
