const fs = require('fs');
const path = require('path');
const { encrypt, decrypt } = require('../utils/encryption');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const { Pool } = require('pg');

class MahasiswaService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.storagePath = path.join(__dirname, '..', 'storage');
  }

  getDatabaseClient() {
    return this._pool.connect();
  }

  async create(client, payload) {
    const { nrp, nama_lengkap, program_studi_id, tanggal_lahir, jenis_kelamin, ktm_url, user_id, status_verifikasi_id } = payload;

    const query = {
      text: `INSERT INTO mahasiswa (
            nrp, nama_lengkap, program_studi_id, tanggal_lahir,
            jenis_kelamin, ktm_url, user_id, status_verifikasi_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING *`,
      values: [
        nrp, nama_lengkap, program_studi_id, tanggal_lahir,
        jenis_kelamin, ktm_url, user_id, status_verifikasi_id,
      ],
    };

    const result = await client.query(query);
    return result.rows[0];
  }

  async getAll() {
    const query = `
      SELECT mahasiswa.*, 
             ps.id AS program_studi_id,
             ps.jenjang, 
             ps.nama_program_studi, 
             sv.id AS status_verifikasi_id,
             sv.label AS status_verifikasi_label,
             sv.warna AS status_verifikasi_warna,
             u.phone_number
        FROM mahasiswa
        LEFT JOIN "user" u ON mahasiswa.user_id = u.id
        LEFT JOIN program_studi ps ON mahasiswa.program_studi_id = ps.id
        LEFT JOIN status_verifikasi sv ON mahasiswa.status_verifikasi_id = sv.id
       WHERE mahasiswa.deleted_at IS NULL
    `;

    const result = await this._pool.query(query);

    // Format the results to return the nested structure
    const formattedResults = result.rows.map(row => ({
      id: row.id,
      nrp: row.nrp,
      nama_lengkap: row.nama_lengkap,
      phone_number: row.phone_number,
      program_studi: {
        id: row.program_studi_id,
        jenjang: row.jenjang,
        nama_program_studi: row.nama_program_studi
      },
      status_verifikasi: {
        id: row.status_verifikasi_id,
        label: row.status_verifikasi_label,
        warna: row.status_verifikasi_warna
      },
      ktm_url: row.ktm_url,
      jenis_kelamin: row.jenis_kelamin,
      tanggal_lahir: row.tanggal_lahir,
      user_id: row.user_id,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    return formattedResults;
  }

  async getById(id) {
    const query = {
      text: `
        SELECT mahasiswa.*, 
               ps.id AS program_studi_id,
               ps.jenjang, 
               ps.nama_program_studi, 
               sv.id AS status_verifikasi_id,
               sv.label AS status_verifikasi_label
          FROM mahasiswa
          LEFT JOIN program_studi ps ON mahasiswa.program_studi_id = ps.id
          LEFT JOIN status_verifikasi sv ON mahasiswa.status_verifikasi_id = sv.id
         WHERE mahasiswa.id = $1 AND mahasiswa.deleted_at IS NULL
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Mahasiswa not found.');
    }

    const row = result.rows[0];

    // Format the result to return the nested structure
    const formattedResult = {
      id: row.id,
      nrp: row.nrp,
      nama_lengkap: row.nama_lengkap,
      program_studi: {
        id: row.program_studi_id,
        jenjang: row.jenjang,
        nama: row.nama_program_studi
      },
      status_verifikasi: {
        id: row.status_verifikasi_id,
        label: row.status_verifikasi_label
      },
      ktm_url: row.ktm_url,
      jenis_kelamin: row.jenis_kelamin,
      tanggal_lahir: row.tanggal_lahir,
      user_id: row.user_id,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at
    };

    return formattedResult;
  }

  async getByNrp(nrp) {
    const result = await this._pool.query({
      text: `SELECT * FROM mahasiswa WHERE nrp = $1 AND deleted_at IS NULL`,
      values: [nrp],
    });

    return result.rows[0] || null;
  }

  async getByUserId(userId) {
    const query = {
      text: `
      SELECT mahasiswa.*, 
             ps.id AS program_studi_id,
             ps.jenjang, 
             ps.nama_program_studi,
             d.name, 
             sv.id AS status_verifikasi_id,
             sv.label AS status_verifikasi_label,
             sv.warna AS status_verifikasi_warna
        FROM mahasiswa
        LEFT JOIN program_studi ps ON mahasiswa.program_studi_id = ps.id
        LEFT JOIN departement d ON ps.departement_id = d.id
        LEFT JOIN status_verifikasi sv ON mahasiswa.status_verifikasi_id = sv.id
       WHERE mahasiswa.user_id = $1 AND mahasiswa.deleted_at IS NULL
    `,
      values: [userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) return null;

    const row = result.rows[0];

    return {
      id: row.id,
      nrp: row.nrp,
      nama_lengkap: row.nama_lengkap,
      program_studi: {
        id: row.program_studi_id,
        jenjang: row.jenjang,
        nama_program_studi: row.nama_program_studi,
        departement: row.name,
      },
      jenis_kelamin: row.jenis_kelamin,
      tanggal_lahir: row.tanggal_lahir,
      status_verifikasi: {
        id: row.status_verifikasi_id,
        label: row.status_verifikasi_label,
        warna: row.status_verifikasi_warna,
      },
      catatan_verifikasi: row.catatan_verifikasi,
      ktm_url: row.ktm_url,
      user_id: row.user_id,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async getMahasiswaWithJanjiTemu() {
    const query = `
    SELECT DISTINCT ON (mahasiswa.nrp) 
           mahasiswa.*, 
           ps.id AS program_studi_id,
           ps.jenjang, 
           ps.nama_program_studi, 
           sv.id AS status_verifikasi_id,
           sv.label AS status_verifikasi_label,
           sv.warna AS status_verifikasi_warna,
           u.phone_number
    FROM mahasiswa
    LEFT JOIN "user" u ON mahasiswa.user_id = u.id
    LEFT JOIN program_studi ps ON mahasiswa.program_studi_id = ps.id
    LEFT JOIN status_verifikasi sv ON mahasiswa.status_verifikasi_id = sv.id
    WHERE mahasiswa.deleted_at IS NULL
      AND EXISTS (
        SELECT 1 FROM janji_temu jt
        WHERE jt.nrp = mahasiswa.nrp
          AND jt.deleted_at IS NULL
      )
  `;

    const result = await this._pool.query(query);

    // Format the results to return the nested structure
    const formattedResults = result.rows.map(row => ({
      id: row.id,
      nrp: row.nrp,
      nama_lengkap: row.nama_lengkap,
      program_studi: {
        id: row.program_studi_id,
        jenjang: row.jenjang,
        nama_program_studi: row.nama_program_studi
      },
      status_verifikasi: {
        id: row.status_verifikasi_id,
        label: row.status_verifikasi_label,
        warna: row.status_verifikasi_warna
      },
      ktm_url: row.ktm_url,
      jenis_kelamin: row.jenis_kelamin,
      tanggal_lahir: row.tanggal_lahir,
      user_id: row.user_id,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    return formattedResults;
  }

  async verifyMahasiswa(id, { status_verifikasi_id, catatan_verifikasi = null, verified_by }) {
    const result = await this._pool.query({
      text: `
        UPDATE mahasiswa SET
          status_verifikasi_id = $1,
          catatan_verifikasi = $2,
          verified_at = NOW(),
          verified_by = $3,
          updated_at = NOW()
        WHERE id = $4 AND deleted_at IS NULL
        RETURNING *
      `,
      values: [status_verifikasi_id, catatan_verifikasi, verified_by, id],
    });

    if (!result.rows.length) {
      throw new NotFoundError('Failed to verify mahasiswa.');
    }

    return result.rows[0];
  }

  async requestReVerification(id, payload) {
    const {
      status_verifikasi_id,
      updated_by
    } = payload;

    const result = await this._pool.query({
      text: `
      UPDATE mahasiswa SET
        status_verifikasi_id = $1,
        updated_at = NOW(),
        updated_by = $2
      WHERE id = $3 AND deleted_at IS NULL
      RETURNING *
    `,
      values: [
        status_verifikasi_id,
        updated_by,
        id
      ],
    });

    if (!result.rows.length) {
      throw new NotFoundError("Mahasiswa tidak ditemukan atau sudah dihapus.");
    }

    return result.rows[0];
  }

  async update(id, payload) {
    const existing = await this.getById(id);

    const {
      nrp = existing.nrp,
      nama_lengkap = existing.nama_lengkap,
      program_studi_id = existing.program_studi_id,
      tanggal_lahir = existing.tanggal_lahir,
      jenis_kelamin = existing.jenis_kelamin,
      ktm_url = existing.ktm_url,
      is_active = existing.is_active,
      updated_by
    } = payload;

    const result = await this._pool.query({
      text: `
        UPDATE mahasiswa SET
          nrp = $1,
          nama_lengkap = $2,
          program_studi_id = $3,
          tanggal_lahir = $4,
          jenis_kelamin = $5,
          ktm_url = $6,
          is_active = $7,
          updated_at = NOW(),
          updated_by = $8
        WHERE id = $9 AND deleted_at IS NULL
        RETURNING *
      `,
      values: [
        nrp,
        nama_lengkap,
        program_studi_id,
        tanggal_lahir,
        jenis_kelamin,
        ktm_url,
        is_active,
        updated_by,
        id
      ],
    });

    if (!result.rows.length) {
      throw new NotFoundError("Mahasiswa not found or already deleted.");
    }

    return result.rows[0];
  }

  async updateKtm(client, mahasiswaId, ktmUrl) {
    const query = {
      text: `
            UPDATE mahasiswa 
            SET ktm_url = $1, updated_at = NOW() 
            WHERE id = $2
            RETURNING *;
        `,
      values: [ktmUrl, mahasiswaId],
    };

    const result = await client.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Gagal memperbarui KTM, mahasiswa tidak ditemukan');
    }

    return result.rows[0];
  }

  async softDelete(client, id, deletedBy) {
    const query = {
      text: `
            UPDATE mahasiswa 
            SET deleted_at = NOW(), deleted_by = $1
            WHERE id = $2 AND deleted_at IS NULL
            RETURNING *
      `,
      values: [deletedBy, id],
    };

    const result = await client.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Mahasiswa tidak ditemukan atau sudah dihapus');
    }

    return result.rows[0];
  }

  async getMahasiswaByKonselorId(konselorProfilId) {
    const query = {
      text: `
      WITH sesi_konselor AS (
        SELECT 
          m.nrp,
          COUNT(k.id) AS total_sesi_dengan_konselor
        FROM konseling k
        JOIN janji_temu jt ON k.janji_temu_id = jt.id
        JOIN mahasiswa m ON jt.nrp = m.nrp
        WHERE k.konselor_profil_id = $1
          AND k.deleted_at IS NULL
        GROUP BY m.nrp
      ),
      sesi_total AS (
        SELECT 
          m.nrp,
          COUNT(k.id) AS total_sesi_semua_konselor
        FROM konseling k
        JOIN janji_temu jt ON k.janji_temu_id = jt.id
        JOIN mahasiswa m ON jt.nrp = m.nrp
        WHERE k.deleted_at IS NULL
        GROUP BY m.nrp
      )
      SELECT DISTINCT
        m.nrp,
        m.nama_lengkap AS nama_mahasiswa,
        m.jenis_kelamin,
        ps.jenjang, 
        ps.nama_program_studi,
        COALESCE(sc.total_sesi_dengan_konselor, 0) AS total_sesi_dengan_konselor,
        COALESCE(st.total_sesi_semua_konselor, 0) AS total_sesi_semua_konselor
      FROM mahasiswa m
      LEFT JOIN program_studi ps ON m.program_studi_id = ps.id
      LEFT JOIN sesi_konselor sc ON m.nrp = sc.nrp
      LEFT JOIN sesi_total st ON m.nrp = st.nrp
      WHERE sc.nrp IS NOT NULL
      ORDER BY m.nama_lengkap ASC;
      `,
      values: [konselorProfilId],
    };

    const result = await this._pool.query(query);

    return result.rows.map(row => ({
      nrp: row.nrp,
      nama_mahasiswa: row.nama_mahasiswa,
      jenjang: row.jenjang,
      nama_program_studi: row.nama_program_studi,
      jenis_kelamin: row.jenis_kelamin,
      total_sesi_dengan_konselor: parseInt(row.total_sesi_dengan_konselor),
      total_sesi_keseluruhan: parseInt(row.total_sesi_semua_konselor),
    }));
  }

  async getRekamMedisByNrp(nrp) {
    const query = {
      text: `
      WITH konseling_data AS (
        SELECT
          m.id AS mahasiswa_id,
          m.nrp,
          m.nama_lengkap,
          m.program_studi_id,
          m.jenis_kelamin,
          m.tanggal_lahir,
          ps.jenjang, 
          ps.nama_program_studi, 
          k.id AS konseling_id,
          k.konselor_profil_id,
          kp.nama_lengkap AS nama_konselor,
          k.tanggal_konseling,
          k.jam_mulai,
          k.jam_selesai,
          k.lokasi,
          k.status_kehadiran,
          jt.tipe_konsultasi,
          jt.created_at AS janji_temu_created_at,
          s.label AS status_label,
          s.warna AS status_warna,
          c.id AS catatan_konseling_id,
          c.deskripsi_masalah,
          c.usaha,
          c.kendala,
          c.pencapaian,
          c.diagnosis,
          c.intervensi,
          c.tindak_lanjut,
          c.created_at AS catatan_created_at,
          ROW_NUMBER() OVER (PARTITION BY m.nrp ORDER BY jt.created_at ASC) AS pertemuan_ke
        FROM mahasiswa m
        JOIN program_studi ps ON m.program_studi_id = ps.id
        JOIN janji_temu jt ON m.nrp = jt.nrp
        JOIN konseling k ON jt.id = k.janji_temu_id  -- INNER JOIN untuk pastikan ada data konseling
        LEFT JOIN konselor_profil kp ON k.konselor_profil_id = kp.id
        LEFT JOIN status s ON k.status_id = s.id
        LEFT JOIN catatan_konseling c ON k.id = c.konseling_id
        WHERE m.nrp = $1 
          AND m.deleted_at IS NULL
          AND k.id IS NOT NULL
      )
      SELECT * FROM konseling_data
      ORDER BY tanggal_konseling DESC, jam_mulai ASC
      `,
      values: [nrp],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      return null;
    }

    const mahasiswaData = result.rows[0];
    const rekamMedis = [];

    result.rows.forEach(row => {
      const konselorName = row.nama_lengkap 
        ? row.nama_konselor
        : 'Tidak ada konselor';
      
      const statusKonseling = row.status_label || 'Status tidak ditemukan';

      let durasi = null;
      if (row.jam_mulai && row.jam_selesai) {
        const jamMulai = new Date(`1970-01-01T${row.jam_mulai}:00Z`);
        const jamSelesai = new Date(`1970-01-01T${row.jam_selesai}:00Z`);
        durasi = (jamSelesai - jamMulai) / 1000 / 60;
      }

      const catatanKonseling = row.catatan_konseling_id ? {
        id: row.catatan_konseling_id,
        deskripsi_masalah: decrypt(row.deskripsi_masalah),
        usaha: decrypt(row.usaha),
        kendala: decrypt(row.kendala),
        pencapaian: decrypt(row.pencapaian),
        diagnosis: decrypt(row.diagnosis),
        intervensi: decrypt(row.intervensi),
        tindak_lanjut: decrypt(row.tindak_lanjut),
        created_at: row.catatan_created_at,
      } : null;

      rekamMedis.push({
        konseling_id: row.konseling_id,
        konselor: konselorName,
        tanggal_konseling: row.tanggal_konseling,
        jam_mulai: row.jam_mulai,
        jam_selesai: row.jam_selesai,
        lokasi: row.lokasi,
        status: {
          label: statusKonseling,
          warna: row.status_warna
        },
        durasi: durasi,
        pertemuan_ke: row.pertemuan_ke,
        tipe_konsultasi: row.tipe_konsultasi,
        catatan_konseling: catatanKonseling,
      });
    });

    return {
      id: mahasiswaData.mahasiswa_id,
      nrp: mahasiswaData.nrp,
      nama_lengkap: mahasiswaData.nama_lengkap,
      jenjang: mahasiswaData.jenjang,
      program_studi: mahasiswaData.nama_program_studi,
      tanggal_lahir: mahasiswaData.tanggal_lahir,
      jenis_kelamin: mahasiswaData.jenis_kelamin,
      rekam_medis: rekamMedis,
    };
  }
}

module.exports = MahasiswaService;
