const { Pool } = require('pg');
const { encrypt, decrypt } = require('../utils/encryption');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

function decryptCatatan(catatan) {
  return {
    ...catatan,
    deskripsi_masalah: decrypt(catatan.deskripsi_masalah),
    usaha: decrypt(catatan.usaha),
    kendala: decrypt(catatan.kendala),
    pencapaian: decrypt(catatan.pencapaian),
    diagnosis: decrypt(catatan.diagnosis),
    intervensi: decrypt(catatan.intervensi),
    tindak_lanjut: decrypt(catatan.tindak_lanjut),
    konseling_lanjutan: decrypt(catatan.konseling_lanjutan),
  };
}

class CatatanKonselingService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  // Menambahkan catatan konseling baru
  async create(payload) {
    const {
      konseling_id,
      deskripsi_masalah,
      usaha,
      kendala,
      pencapaian,
      diagnosis,
      intervensi,
      tindak_lanjut,
      konseling_lanjutan,
      created_by,
    } = payload;

    const query = {
      text: `
        INSERT INTO catatan_konseling (
          konseling_id, deskripsi_masalah, usaha, kendala,
          pencapaian, diagnosis, intervensi, tindak_lanjut,
          konseling_lanjutan, created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
        RETURNING *
      `,
      values: [
        konseling_id,
        encrypt(deskripsi_masalah),
        encrypt(usaha),
        encrypt(kendala),
        encrypt(pencapaian),
        encrypt(diagnosis),
        encrypt(intervensi),
        encrypt(tindak_lanjut),
        encrypt(konseling_lanjutan),
        created_by,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal menambahkan catatan konseling');
    }

    return result.rows[0].id;
  }

  async getAll() {
    const query = {
      text: `
        SELECT * FROM catatan_konseling
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
      `,
    };

    const result = await this._pool.query(query);
    return result.rows.map(decryptCatatan);
  }

  async getByKonselingId(konseling_id) {
    const query = {
      text: `
        SELECT * FROM catatan_konseling
        WHERE konseling_id = $1 AND deleted_at IS NULL
        ORDER BY created_at DESC
      `,
      values: [konseling_id],
    };

    const result = await this._pool.query(query);
    return result.rows.map(decryptCatatan);
  }

  async getById(id) {
    const query = {
      text: `
        SELECT * FROM catatan_konseling
        WHERE id = $1 AND deleted_at IS NULL
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan konseling tidak ditemukan');
    }

    return decryptCatatan(result.rows[0]);
  }

  async isKonselingOwnedByUser(konselingId, userId) {
    const query = {
      text: `
        SELECT jt.id
        FROM konseling k
        JOIN janji_temu jt ON k.janji_temu_id = jt.id
        JOIN mahasiswa mhs ON jt.nrp = mhs.nrp
        WHERE k.id = $1 AND jt.deleted_at IS NULL AND mhs.user_id = $2
      `,
      values: [konselingId, userId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async update(id, payload) {
    const {
      deskripsi_masalah,
      usaha,
      kendala,
      pencapaian,
      diagnosis,
      intervensi,
      tindak_lanjut,
      konseling_lanjutan,
      updated_by,
    } = payload;

    const existing = await this.getById(id);

    const query = {
      text: `
        UPDATE catatan_konseling
        SET
          deskripsi_masalah = $1,
          usaha = $2,
          kendala = $3,
          pencapaian = $4,
          diagnosis = $5,
          intervensi = $6,
          tindak_lanjut = $7,
          konseling_lanjutan = $8,
          updated_by = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10 AND deleted_at IS NULL
        RETURNING *
      `,
      values: [
        encrypt(deskripsi_masalah ?? existing.deskripsi_masalah),
        encrypt(usaha ?? existing.usaha),
        encrypt(kendala ?? existing.kendala),
        encrypt(pencapaian ?? existing.pencapaian),
        encrypt(diagnosis ?? existing.diagnosis),
        encrypt(intervensi ?? existing.intervensi),
        encrypt(tindak_lanjut ?? existing.tindak_lanjut),
        encrypt(konseling_lanjutan ?? existing.konseling_lanjutan),
        updated_by,
        id,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui catatan konseling. ID tidak ditemukan');
    }

    return result.rows[0].id;
  }

  async delete(id, deleted_by) {
    const query = {
      text: `
        UPDATE catatan_konseling
        SET deleted_at = CURRENT_TIMESTAMP,
            deleted_by = $1
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *
      `,
      values: [deleted_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan konseling tidak ditemukan atau sudah dihapus');
    }

    return result.rows[0].id;
  }
}

module.exports = CatatanKonselingService;
