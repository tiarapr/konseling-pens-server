const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

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
      created_by
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
        RETURNING id
      `,
      values: [
        konseling_id,
        deskripsi_masalah,
        usaha,
        kendala,
        pencapaian,
        diagnosis,
        intervensi,
        tindak_lanjut,
        konseling_lanjutan,
        created_by
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal menambahkan catatan konseling');
    }

    return result.rows[0].id;
  }

  // Mengambil semua catatan konseling yang belum dihapus
  async getAll() {
    const query = {
      text: `
          SELECT * FROM catatan_konseling
          WHERE deleted_at IS NULL
          ORDER BY created_at DESC
        `,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  // Mengambil semua catatan konseling berdasarkan konseling_id
  async getByKonselingId(konseling_id) {
    // Ambil semua catatan konseling
    const catatanQuery = {
      text: `
        SELECT * FROM catatan_konseling
        WHERE konseling_id = $1 AND deleted_at IS NULL
        ORDER BY created_at DESC
      `,
      values: [konseling_id],
    };
  
    const catatanResult = await this._pool.query(catatanQuery);
    const catatanList = catatanResult.rows;
  
    // Untuk setiap catatan, ambil topik dari konseling terkait
    const detailedCatatan = await Promise.all(catatanList.map(async (catatan) => {
      const topikQuery = {
        text: `
          SELECT t.id, t.name
          FROM konseling_topik kt
          JOIN topik t ON kt.topik_id = t.id
          WHERE kt.konseling_id = $1 AND kt.deleted_at IS NULL
        `,
        values: [catatan.konseling_id],
      };
  
      const topikResult = await this._pool.query(topikQuery);
      return {
        ...catatan,
        topik: topikResult.rows, // list of topik
      };
    }));
  
    return detailedCatatan;
  }  

  // Mengambil catatan konseling berdasarkan ID
  async getById(id) {
    // Ambil catatan konseling terlebih dahulu
    const catatanQuery = {
      text: `
        SELECT * FROM catatan_konseling
        WHERE id = $1 AND deleted_at IS NULL
      `,
      values: [id],
    };
  
    const catatanResult = await this._pool.query(catatanQuery);
  
    if (!catatanResult.rows.length) {
      throw new NotFoundError('Catatan konseling tidak ditemukan');
    }
  
    const catatan = catatanResult.rows[0];
  
    // Ambil topik berdasarkan konseling_id
    const topikQuery = {
      text: `
        SELECT t.id, t.name
        FROM konseling_topik kt
        JOIN topik t ON kt.topik_id = t.id
        WHERE kt.konseling_id = $1 AND kt.deleted_at IS NULL
      `,
      values: [catatan.konseling_id],
    };
  
    const topikResult = await this._pool.query(topikQuery);
  
    // Gabungkan catatan dan topik
    return {
      ...catatan,
      topik: topikResult.rows,
    };
  }  

  // Memperbarui catatan konseling berdasarkan ID
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
      updated_by
    } = payload;

    const existing = await this.getById(id);

    const updatedDeskripsiMasalah = deskripsi_masalah ?? existing.deskripsi_masalah;
    const updatedUsaha = usaha ?? existing.usaha;
    const updatedKendala = kendala ?? existing.kendala;
    const updatedPencapaian = pencapaian ?? existing.pencapaian;
    const updatedDiagnosis = diagnosis ?? existing.diagnosis;
    const updatedIntervensi = intervensi ?? existing.intervensi;
    const updatedTindakLanjut = tindak_lanjut ?? existing.tindak_lanjut;
    const updatedKonselingLanjutan = konseling_lanjutan ?? existing.konseling_lanjutan;

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
        RETURNING id
      `,
      values: [
        updatedDeskripsiMasalah,
        updatedUsaha,
        updatedKendala,
        updatedPencapaian,
        updatedDiagnosis,
        updatedIntervensi,
        updatedTindakLanjut,
        updatedKonselingLanjutan,
        updated_by,
        id
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui catatan konseling. ID tidak ditemukan');
    }

    return result.rows[0].id;
  }

  // Menghapus catatan konseling berdasarkan ID
  async delete(id, deleted_by) {
    const query = {
      text: `
        UPDATE catatan_konseling
        SET deleted_at = CURRENT_TIMESTAMP,
            deleted_by = $1
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING id
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
