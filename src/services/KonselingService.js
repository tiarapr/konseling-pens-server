const { Pool } = require("pg");
const InvariantError = require("../exceptions/InvariantError");
const NotFoundError = require("../exceptions/NotFoundError");

class KonselingService {
  constructor() {
    this._pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async create(payload) {
    const {
      janji_temu_id,
      konselor_profil_id,
      tanggal_konseling,
      jam_mulai,
      jam_selesai,
      lokasi,
      status_kehadiran,
      tanggal_konfirmasi,
      status_id,
      created_by,
    } = payload;

    const query = {
      text: `
        INSERT INTO konseling (
          janji_temu_id, konselor_profil_id, tanggal_konseling, jam_mulai, jam_selesai, lokasi,
          status_kehadiran, tanggal_konfirmasi, status_id, created_by
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10
        )
        RETURNING *`,
      values: [
        janji_temu_id, konselor_profil_id, tanggal_konseling, jam_mulai, jam_selesai, lokasi,
        status_kehadiran, tanggal_konfirmasi, status_id, created_by,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Gagal menambahkan konseling");
    }

    return result.rows[0];
  }

  async getAll() {
    const query = {
      text: `
      SELECT
        k.id,
        k.janji_temu_id,
        jt.nrp AS nrp_mahasiswa,
        jt.tipe_konsultasi,
        m.nama_lengkap AS nama_mahasiswa,
        u.phone_number,
        k.konselor_profil_id,
        kp.nama_lengkap AS nama_konselor,
        s.label AS status,
        s.warna AS status_warna,
        TO_CHAR(k.tanggal_konseling, 'YYYY-MM-DD') AS tanggal_konseling,
        TO_CHAR(k.jam_mulai, 'HH24:MI') AS jam_mulai,
        TO_CHAR(k.jam_selesai, 'HH24:MI') AS jam_selesai,
        k.lokasi,
        k.status_kehadiran,
        k.tanggal_konfirmasi,
        k.status_id,
        k.created_at,
        k.created_by,
        k.updated_at,
        k.updated_by,
        k.deleted_at,
        k.deleted_by,
        r.rating AS nilai_rating,
        r.ulasan,
        r.created_at AS rating_created_at,
        EXTRACT(EPOCH FROM (k.jam_selesai - k.jam_mulai)) / 60 AS durasi_menit
      FROM konseling k
      JOIN janji_temu jt ON k.janji_temu_id = jt.id
      JOIN mahasiswa m ON jt.nrp = m.nrp
      JOIN "user" u ON m.user_id = u.id
      JOIN konselor_profil kp ON k.konselor_profil_id = kp.id
      JOIN status s ON k.status_id = s.id
      LEFT JOIN rating r ON k.id = r.konseling_id
      WHERE k.deleted_at IS NULL
      ORDER BY k.tanggal_konseling DESC, k.jam_mulai ASC;
    `
    };

    const result = await this._pool.query(query);

    return result.rows.map(row => ({
      id: row.id,
      janji_temu_id: row.janji_temu_id,
      tipe_konsultasi: row.tipe_konsultasi,
      mahasiswa: {
        nrp: row.nrp_mahasiswa,
        nama: row.nama_mahasiswa,
      },
      no_telp: row.phone_number,
      konselor: row.nama_konselor,
      tanggal_konseling: row.tanggal_konseling,
      jam_mulai: row.jam_mulai,
      jam_selesai: row.jam_selesai,
      lokasi: row.lokasi,
      status_kehadiran: row.status_kehadiran,
      tanggal_konfirmasi: row.tanggal_konfirmasi,
      status: {
        id: row.status_id,
        name: row.status,
        warna: row.status_warna,
      },
      rating: row.nilai_rating
        ? {
          nilai: row.nilai_rating,
          ulasan: row.ulasan,
          created_at: row.rating_created_at,
        }
        : null,
      durasi: row.durasi_menit ? parseInt(row.durasi_menit) : null, // durasi dalam menit (integer)
      created_at: row.created_at,
      created_by: row.created_by,
      updated_at: row.updated_at,
      updated_by: row.updated_by,
      deleted_at: row.deleted_at,
      deleted_by: row.deleted_by,
    }));
  }

  async getById(id) {
    const query = {
      text: `
      SELECT
        k.id,
        k.janji_temu_id,
        jt.nomor_tiket,
        jt.nrp,
        jt.tipe_konsultasi,
        jt.jadwal_utama_tanggal,
        jt.jadwal_utama_jam_mulai,
        jt.jadwal_utama_jam_selesai,
        jt.jadwal_alternatif_tanggal,
        jt.jadwal_alternatif_jam_mulai,
        jt.jadwal_alternatif_jam_selesai,
        jt.tanggal_pengajuan,
        m.nama_lengkap AS nama_mahasiswa,
        mahasiswa_user.phone_number AS no_telp_mahasiswa,
        k.konselor_profil_id,
        kp.nama_lengkap AS nama_konselor,
        konselor_user.phone_number AS no_telp_konselor,
        s.label AS status,
        s.warna AS status_warna,
        k.tanggal_konseling,
        k.jam_mulai,
        k.jam_selesai,
        k.lokasi,
        k.status_kehadiran,
        k.tanggal_konfirmasi,
        k.status_id,
        k.created_at,
        k.created_by,
        k.updated_at,
        k.updated_by,
        k.deleted_at,
        k.deleted_by,
        r.id as rating_id,
        r.rating as nilai_rating,
        r.ulasan,
        r.created_at as rating_created_at,

        -- Hitung pertemuan ke berapa berdasarkan sesi mahasiswa
        (
          SELECT COUNT(*)
          FROM konseling k2
          JOIN janji_temu jt2 ON k2.janji_temu_id = jt2.id
          WHERE jt2.nrp = jt.nrp
            AND k2.deleted_at IS NULL
            AND (
              k2.tanggal_konseling < k.tanggal_konseling
              OR (k2.tanggal_konseling = k.tanggal_konseling AND k2.jam_mulai <= k.jam_mulai)
            )
        ) AS pertemuan_ke,

        EXTRACT(EPOCH FROM (k.jam_selesai - k.jam_mulai)) / 60 AS durasi_menit -- durasi dalam menit

      FROM konseling k
      JOIN janji_temu jt ON k.janji_temu_id = jt.id
      JOIN mahasiswa m ON jt.nrp = m.nrp
      JOIN "user" mahasiswa_user ON m.user_id = mahasiswa_user.id
      JOIN konselor_profil kp ON k.konselor_profil_id = kp.id
      JOIN "user" konselor_user ON kp.user_id = konselor_user.id 
      JOIN status s ON k.status_id = s.id
      LEFT JOIN rating r ON k.id = r.konseling_id
      WHERE k.id = $1 AND k.deleted_at IS NULL
    `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Konseling tidak ditemukan");
    }

    const row = result.rows[0];

    return {
      id: row.id,
      janji_temu: {
        id: row.janji_temu_id,
        nomor_tiket: row.nomor_tiket,
        tipe_konsultasi: row.tipe_konsultasi,
        jadwal_utama: {
          tanggal: row.jadwal_utama_tanggal,
          jam_mulai: row.jadwal_utama_jam_mulai,
          jam_selesai: row.jadwal_utama_jam_selesai,
        },
        jadwal_alternatif: {
          tanggal: row.jadwal_alternatif_tanggal,
          jam_mulai: row.jadwal_alternatif_jam_mulai,
          jam_selesai: row.jadwal_alternatif_jam_selesai,
        },
      },
      konselor: {
        id: row.konselor_profil_id,
        nama: row.nama_konselor,
        no_telp: row.no_telp_konselor,
      },
      mahasiswa: {
        nrp: row.nrp,
        nama: row.nama_mahasiswa,
        no_telp:  row.no_telp_mahasiswa,
      },
      tanggal_konseling: row.tanggal_konseling,
      jam_mulai: row.jam_mulai,
      jam_selesai: row.jam_selesai,
      lokasi: row.lokasi,
      status_kehadiran: row.status_kehadiran,
      tanggal_konfirmasi: row.tanggal_konfirmasi,
      status: {
        id: row.status_id,
        name: row.status,
        warna: row.status_warna,
      },
      rating: row.rating_id
        ? {
          id: row.rating_id,
          nilai: row.nilai_rating,
          ulasan: row.ulasan,
          created_at: row.rating_created_at,
        }
        : null,
      pertemuan_ke: row.pertemuan_ke, // Ditambahkan
      durasi: row.durasi, // Ditambahkan
      created_at: row.created_at,
      created_by: row.created_by,
      updated_at: row.updated_at,
      updated_by: row.updated_by,
      deleted_at: row.deleted_at,
      deleted_by: row.deleted_by,
    };
  }

  async getByNrp(nrp) {
    const query = {
      text: `
      SELECT
        k.id,
        k.janji_temu_id,
        jt.nrp,
        jt.tipe_konsultasi,
        m.nama_lengkap AS nama_mahasiswa,
        k.konselor_profil_id,
        kp.nama_lengkap AS nama_konselor,
        s.label AS status,
        s.warna AS status_warna,
        TO_CHAR(k.tanggal_konseling, 'YYYY-MM-DD') AS tanggal_konseling,
        TO_CHAR(k.jam_mulai, 'HH24:MI') AS jam_mulai,
        TO_CHAR(k.jam_selesai, 'HH24:MI') AS jam_selesai,
        k.lokasi,
        k.status_kehadiran,
        k.tanggal_konfirmasi,
        k.status_id,
        k.created_at,
        k.created_by,
        k.updated_at,
        k.updated_by,
        k.deleted_at,
        k.deleted_by,
        r.rating AS nilai_rating,
        r.ulasan,
        r.created_at AS rating_created_at,
        EXTRACT(EPOCH FROM (k.jam_selesai - k.jam_mulai)) / 60 AS durasi_menit
      FROM konseling k
      JOIN janji_temu jt ON k.janji_temu_id = jt.id
      JOIN mahasiswa m ON jt.nrp = m.nrp
      LEFT JOIN konselor_profil kp ON k.konselor_profil_id = kp.id
      JOIN status s ON k.status_id = s.id
      LEFT JOIN rating r ON k.id = r.konseling_id
      WHERE jt.nrp = $1 AND k.deleted_at IS NULL
      ORDER BY k.tanggal_konseling DESC, k.jam_mulai ASC
    `,
      values: [nrp],
    };

    const result = await this._pool.query(query);

    return result.rows.map(row => ({
      id: row.id,
      janji_temu_id: row.janji_temu_id,
      tipe_konsultasi: row.tipe_konsultasi,
      mahasiswa: row.nama_mahasiswa,
      konselor: row.nama_konselor,
      tanggal_konseling: row.tanggal_konseling,
      jam_mulai: row.jam_mulai,
      jam_selesai: row.jam_selesai,
      lokasi: row.lokasi,
      status_kehadiran: row.status_kehadiran,
      tanggal_konfirmasi: row.tanggal_konfirmasi,
      status: {
        id: row.status_id,
        name: row.status,
        warna: row.status_warna,
      },
      rating: row.nilai_rating
        ? {
          nilai: row.nilai_rating,
          ulasan: row.ulasan,
          created_at: row.rating_created_at,
        }
        : null,
      durasi: row.durasi_menit ? parseInt(row.durasi_menit) : null,
      created_at: row.created_at,
      created_by: row.created_by,
      updated_at: row.updated_at,
      updated_by: row.updated_by,
      deleted_at: row.deleted_at,
      deleted_by: row.deleted_by,
    }));
  }

  async getByKonselorId(konselorProfilId) {
    const query = {
      text: `
      SELECT
        k.id,
        k.janji_temu_id,
        jt.nrp,
        jt.tipe_konsultasi,
        m.nama_lengkap AS nama_mahasiswa,
        u.phone_number,
        m.id AS id_mahasiswa,
        m.nrp AS nrp_mahasiswa,
        k.konselor_profil_id,
        kp.nama_lengkap AS nama_konselor,
        konselor_user.phone_number AS no_telp_konselor,
        s.label AS status,
        s.warna AS status_warna,
        TO_CHAR(k.tanggal_konseling, 'YYYY-MM-DD') AS tanggal_konseling,
        TO_CHAR(k.jam_mulai, 'HH24:MI') AS jam_mulai,
        TO_CHAR(k.jam_selesai, 'HH24:MI') AS jam_selesai,
        k.lokasi,
        k.status_kehadiran,
        k.tanggal_konfirmasi,
        k.status_id,
        k.created_at,
        k.created_by,
        k.updated_at,
        k.updated_by,
        k.deleted_at,
        k.deleted_by,
        r.rating AS nilai_rating,
        r.ulasan,
        r.created_at AS rating_created_at,
        EXTRACT(EPOCH FROM (k.jam_selesai - k.jam_mulai)) / 60 AS durasi_menit
      FROM konseling k
      JOIN janji_temu jt ON k.janji_temu_id = jt.id
      JOIN mahasiswa m ON jt.nrp = m.nrp
      JOIN "user" u ON m.user_id = u.id
      JOIN konselor_profil kp ON k.konselor_profil_id = kp.id
      JOIN "user" konselor_user ON kp.user_id = konselor_user.id 
      JOIN status s ON k.status_id = s.id
      LEFT JOIN rating r ON k.id = r.konseling_id
      WHERE k.konselor_profil_id = $1 AND k.deleted_at IS NULL
      ORDER BY k.tanggal_konseling DESC, k.jam_mulai ASC;
    `
    };

    const result = await this._pool.query(query, [konselorProfilId]);

    return result.rows.map(row => ({
      id: row.id,
      janji_temu_id: row.janji_temu_id,
      tipe_konsultasi: row.tipe_konsultasi,
      mahasiswa: {
        id: row.id_mahasiswa,
        nama: row.nama_mahasiswa,
        nrp: row.nrp_mahasiswa,
        no_telp: row.phone_number,
      },
      konselor: row.nama_konselor,
      tanggal_konseling: row.tanggal_konseling,
      jam_mulai: row.jam_mulai,
      jam_selesai: row.jam_selesai,
      lokasi: row.lokasi,
      status_kehadiran: row.status_kehadiran,
      tanggal_konfirmasi: row.tanggal_konfirmasi,
      status: {
        id: row.status_id,
        name: row.status,
        warna: row.status_warna,
      },
      rating: row.nilai_rating
        ? {
          nilai: row.nilai_rating,
          ulasan: row.ulasan,
          created_at: row.rating_created_at,
        }
        : null,
      durasi: row.durasi_menit ? parseInt(row.durasi_menit) : null, // durasi dalam menit (integer)
      created_at: row.created_at,
      created_by: row.created_by,
      updated_at: row.updated_at,
      updated_by: row.updated_by,
      deleted_at: row.deleted_at,
      deleted_by: row.deleted_by,
    }));
  }

  async update(id, payload) {
    const {
      konselor_profil_id,
      tanggal_konseling,
      jam_mulai,
      jam_selesai,
      lokasi,
      status_kehadiran,
      tanggal_konfirmasi,
      status_id,
      updated_by,
    } = payload;

    const existing = await this.getById(id);

    const updatedTanggal = tanggal_konseling ?? existing.tanggal_konseling;
    const updatedJamMulai = jam_mulai ?? existing.jam_mulai;
    const updatedJamSelesai = jam_selesai ?? existing.jam_selesai;
    const updatedLokasi = lokasi ?? existing.lokasi;
    const updatedStatusKehadiran = status_kehadiran ?? existing.status_kehadiran;
    const updatedTanggalKonfirmasi = tanggal_konfirmasi ?? existing.tanggal_konfirmasi;
    const updatedStatusId = status_id ?? existing.status.id;
    const updatedKonselorProfilId = konselor_profil_id ?? existing.konselor.id;
    const updatedUpdatedBy = updated_by ?? existing.updated_by;

    const query = {
      text: `
        UPDATE konseling
        SET
          tanggal_konseling = $1,
          jam_mulai = $2,
          jam_selesai = $3,
          lokasi = $4,
          status_kehadiran = $5,
          tanggal_konfirmasi = $6,
          status_id = $7,
          konselor_profil_id = $8,
          updated_by = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10 AND deleted_at IS NULL
        RETURNING *`,
      values: [
        updatedTanggal,
        updatedJamMulai,
        updatedJamSelesai,
        updatedLokasi,
        updatedStatusKehadiran,
        updatedTanggalKonfirmasi,
        updatedStatusId,
        updatedKonselorProfilId,
        updatedUpdatedBy,
        id,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal memperbarui konseling. ID tidak ditemukan");
    }

    return result.rows[0]; 
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
        RETURNING *
      `,
      values: [status_id, updated_by, id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui status konseling. ID tidak ditemukan');
    }

    return result.rows[0];
  }

  async konfirmasiKehadiran(id, { status_kehadiran, status_id, updated_by }) {
    const existing = await this.getById(id);

    // Tentukan nilai status_id, jika status_kehadiran false, maka status_id harus diisi
    const updatedStatusId = status_kehadiran === false ? status_id : existing.status.id;
    const tanggalKonfirmasi = new Date();

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
        RETURNING *
      `,
      values: [
        status_kehadiran,
        tanggalKonfirmasi,
        updatedStatusId,
        updated_by,
        id,
      ],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal mengkonfirmasi kehadiran. ID tidak ditemukan');
    }

    return result.rows[0];
  }

  async softDelete(id, deleted_by) {
    const query = {
      text: `
        UPDATE konseling
        SET deleted_at = CURRENT_TIMESTAMP,
            deleted_by = $1
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *`,
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
