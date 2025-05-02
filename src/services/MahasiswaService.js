const fs = require('fs');
const path = require('path');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class MahasiswaService {
  constructor() {
    this._pool = new (require('pg')).Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Path for the storage folder
    this.storagePath = path.join(__dirname, '..', 'storage');
  }

  // Method to get all mahasiswa
  async getAll() {
    const query = {
      text: `SELECT * FROM mahasiswa WHERE deleted_at IS NULL`,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  // Method to get mahasiswa by ID
  async getById(id) {
    const query = {
      text: `SELECT * FROM mahasiswa WHERE id = $1 AND deleted_at IS NULL`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Mahasiswa not found.");
    }

    return result.rows[0];
  }

  // Method to get mahasiswa by NRP
  async getByNrp(nrp) {
    const query = {
      text: `SELECT * FROM mahasiswa WHERE nrp = $1 AND deleted_at IS NULL`,
      values: [nrp],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      return null;
    }

    return result.rows[0];
  }

  // Method to create Mahasiswa (students)
  async create({
    nrp, nama_lengkap, program_studi_id, tanggal_lahir,
    jenis_kelamin, no_telepon, ktm_url, user_id, status_id, created_by
  }) {
    const existing = await this.getByNrp(nrp);

    if (existing) {
      throw new InvariantError('Mahasiswa already exists.');
    }

    const query = {
      text: `
        INSERT INTO mahasiswa (
          nrp, nama_lengkap, program_studi_id, tanggal_lahir, jenis_kelamin, no_telepon, ktm_url, user_id, status_id, created_by
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
        RETURNING *`,
      values: [nrp, nama_lengkap, program_studi_id, tanggal_lahir, jenis_kelamin, no_telepon, ktm_url, user_id, status_id, created_by],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Failed to create mahasiswa.");
    }

    return result.rows[0];
  }

  // Method to update mahasiswa details
  async update(id, payload) {
    const {
      nrp,
      nama_lengkap,
      program_studi_id,
      tanggal_lahir,
      jenis_kelamin,
      no_telepon,
      ktm_url,
      user_id,
      status_id,
      updated_by
    } = payload;

    // Ambil data lama untuk update
    const existing = await this.getById(id);

    // Jika data tidak disertakan, tetap gunakan data yang ada
    const updatedNrp = nrp ?? existing.nrp;
    const updatedNamaLengkap = nama_lengkap ?? existing.nama_lengkap;
    const updatedProdi = program_studi_id ?? existing.program_studi_id;
    const updatedTanggalLahir = tanggal_lahir ?? existing.tanggal_lahir;
    const updatedJenisKelamin = jenis_kelamin ?? existing.jenis_kelamin;
    const updatedNoTelepon = no_telepon ?? existing.no_telepon;
    const updatedKtmUrl = ktm_url ?? existing.ktm_url;
    const updatedUserId = user_id ?? existing.user_id;
    const updatedStatusId = status_id ?? existing.status_id;

    const query = {
      text: `
        UPDATE mahasiswa
        SET
          nrp = $1, 
          nama_lengkap = $2,
          program_studi_id = $3,
          tanggal_lahir = $4,
          jenis_kelamin = $5,
          no_telepon = $6,
          ktm_url = $7,
          user_id = $8,
          status_id = $9,
          updated_by = $10,
          updated_at = current_timestamp
        WHERE id = $11 AND deleted_at IS NULL
        RETURNING *`,
      values: [
        updatedNrp,
        updatedNamaLengkap,
        updatedProdi,
        updatedTanggalLahir,
        updatedJenisKelamin,
        updatedNoTelepon,
        updatedKtmUrl,
        updatedUserId,
        updatedStatusId,
        updated_by,
        id
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Mahasiswa not found or already deleted.");
    }

    return result.rows[0];
  }

  // Method to delete mahasiswa (soft delete)
  async softDelete(id, deleted_by) {
    const query = {
      text: `
        UPDATE mahasiswa
        SET deleted_by = $1,
            deleted_at = current_timestamp
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *`,
      values: [deleted_by, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Mahasiswa not found or already deleted.");
    }

    return result.rows[0];
  }

  // Method to save the KTM file (upload)
  async saveKtmFile(file) {
    // Ensure the file object contains the necessary properties
    if (!file || !file.hapi || !file.hapi.filename) {
      throw new InvariantError('Invalid file upload.');
    }
  
    // Tentukan path folder penyimpanan KTM
    const ktmStoragePath = path.join(this.storagePath, 'ktm');
  
    // Pastikan folder /storage/ktm ada
    if (!fs.existsSync(ktmStoragePath)) {
      fs.mkdirSync(ktmStoragePath, { recursive: true }); // Buat folder jika belum ada
    }
  
    // Buat nama file unik
    const fileName = `${Date.now()}_${file.hapi.filename}`;
    const filePath = path.join(ktmStoragePath, fileName);
  
    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(filePath);
      file.pipe(fileStream);
  
      fileStream.on('finish', () => {
        resolve({
          fileName,
          filePath,
          url: `/storage/ktm/${fileName}`,
        });
      });
  
      fileStream.on('error', (err) => {
        reject(new InvariantError("Gagal menyimpan file KTM"));
      });
    });
  }  

  async getRekamMedisByNrp(nrp) {
    // Panggil fungsi getByNrp untuk mengambil data mahasiswa berdasarkan nrp
    const mahasiswa = await this.getByNrp(nrp);

    if (!mahasiswa) {
      throw new NotFoundError('Mahasiswa tidak ditemukan');
    }

    // Ambil nama status mahasiswa
    const statusQuery = {
      text: `
      SELECT name FROM status WHERE id = $1
      `,
      values: [mahasiswa.status_id],
    };

    const statusResult = await this._pool.query(statusQuery);
    const statusName = statusResult.rows[0]?.name || 'Unknown';

    // Ambil janji temu berdasarkan nrp mahasiswa
    const janjiTemuQuery = {
      text: `
          SELECT jt.id AS janji_temu_id
          FROM janji_temu jt
          WHERE jt.nrp = $1
        `,
      values: [nrp],
    };

    const janjiTemuResult = await this._pool.query(janjiTemuQuery);

    if (!janjiTemuResult.rows.length) {
      throw new NotFoundError('Janji temu tidak ditemukan untuk mahasiswa ini');
    }

    // Ambil konseling yang terkait dengan janji temu
    const konselingQuery = {
      text: `
      SELECT konseling.id AS konseling_id, konseling.tanggal_konseling, 
             konseling.jam_mulai, konseling.jam_selesai, konseling.lokasi, konseling.status_id,
             konseling.konselor_profil_id
      FROM konseling
      WHERE konseling.janji_temu_id = ANY($1) AND konseling.deleted_at IS NULL
      ORDER BY konseling.tanggal_konseling DESC
    `,
      values: [janjiTemuResult.rows.map(row => row.janji_temu_id)],
    };

    const konselingResult = await this._pool.query(konselingQuery);

    // Ambil catatan dan topik untuk setiap konseling
    const rekamMedis = await Promise.all(
      konselingResult.rows.map(async (konseling) => {
        const catatanQuery = {
          text: `
          SELECT * FROM catatan_konseling 
          WHERE konseling_id = $1 AND deleted_at IS NULL
          ORDER BY created_at ASC
        `,
          values: [konseling.konseling_id],
        };

        const catatanResult = await this._pool.query(catatanQuery);
        const catatanKonseling = catatanResult.rows[0]; // Ambil catatan pertama jika ada

        // Ambil topik konseling
        const topikQuery = {
          text: `
            SELECT topik.id, topik.name 
            FROM topik
            LEFT JOIN konseling_topik ON konseling_topik.topik_id = topik.id
            WHERE konseling_topik.konseling_id = $1
            AND konseling_topik.deleted_at IS NULL 
          `,
          values: [konseling.konseling_id],
        };

        const topikResult = await this._pool.query(topikQuery);
        const topikList = topikResult.rows;

        // Ambil nama konselor
        const konselorQuery = {
          text: `
          SELECT nama_lengkap FROM konselor_profil WHERE id = $1
        `,
          values: [konseling.konselor_profil_id],
        };

        const konselorResult = await this._pool.query(konselorQuery);
        const konselorName = konselorResult.rows[0]?.nama_lengkap || 'Unknown';

        // Ambil nama status
        const statusKonselingQuery = {
          text: `
          SELECT name FROM status WHERE id = $1
        `,
          values: [konseling.status_id],
        };

        const statusKonselingResult = await this._pool.query(statusKonselingQuery);
        const statusKonselingName = statusKonselingResult.rows[0]?.name || 'Unknown';

        return {
          konseling_id: konseling.konseling_id,
          konselor: konselorName,
          tanggal_konseling: konseling.tanggal_konseling,
          jam_mulai: konseling.jam_mulai,
          jam_selesai: konseling.jam_selesai,
          lokasi: konseling.lokasi,
          status: statusKonselingName, // Nama status untuk konseling
          catatan_konseling: {
            id: catatanKonseling?.id || null,
            deskripsi_masalah: catatanKonseling?.deskripsi_masalah || null,
            usaha: catatanKonseling?.usaha || null,
            kendala: catatanKonseling?.kendala || null,
            pencapaian: catatanKonseling?.pencapaian || null,
            diagnosis: catatanKonseling?.diagnosis || null,
            intervensi: catatanKonseling?.intervensi || null,
            tindak_lanjut: catatanKonseling?.tindak_lanjut || null,
            created_at: catatanKonseling?.created_at || null,
            topik: topikList,
          },
        };
      })
    );

    // Return dengan format yang sama, mengganti status_id dengan statusName
    return {
      id: mahasiswa.id,
      nrp: mahasiswa.nrp,
      nama_lengkap: mahasiswa.nama_lengkap,
      program_studi_id: mahasiswa.program_studi_id,
      status: statusName, // Menggunakan nama status mahasiswa
      rekam_medis: rekamMedis,
    };
  }
}

module.exports = MahasiswaService;
