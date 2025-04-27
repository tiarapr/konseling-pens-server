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
      throw new NotFoundError("Mahasiswa not found.");
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
    const existing = await this.getByNrp(nrp);

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
    // Pastikan folder storage ada
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath);  // Membuat folder jika belum ada
    }

    // Membuat nama file yang unik
    const fileName = `${Date.now()}_${file.hapi.filename}`;
    const filePath = path.join(this.storagePath, fileName);

    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(filePath);

      file.pipe(fileStream);  // Menulis file ke dalam folder

      fileStream.on('finish', () => {
        resolve({ fileName, filePath });  // Mengembalikan informasi file yang disimpan
      });

      fileStream.on('error', (err) => {
        reject(new InvariantError("Gagal menyimpan file KTM"));
      });
    });
  }
}

module.exports = MahasiswaService;
