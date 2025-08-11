/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // Create the materialized view for konselor stats
  pgm.sql(`
    CREATE MATERIALIZED VIEW mv_konselor_stats AS
    SELECT 
      kp.id AS konselor_id,
      kp.nama_lengkap AS konselor,
      kp.sipp AS nomor_sipp,
      
      COUNT(DISTINCT jt.id) AS total_permintaan,
      
      COUNT(DISTINCT jt.id) FILTER (WHERE jt.status = 'menunggu_konfirmasi') AS menunggu_konfirmasi,
      COUNT(DISTINCT jt.id) FILTER (WHERE jt.status = 'dikonfirmasi') AS dikonfirmasi,
      COUNT(DISTINCT jt.id) FILTER (WHERE jt.status = 'ditolak') AS ditolak,
      
      COUNT(DISTINCT k.id) AS total_sesi_konseling,
      
      COUNT(DISTINCT k.id) FILTER (WHERE s.kode_status = 'selesai') AS total_sesi_selesai,
      COUNT(DISTINCT k.id) FILTER (WHERE s.kode_status = 'dibatalkan' OR s.kode_status = 'batal_otomatis') AS total_sesi_dibatalkan,
      COUNT(DISTINCT k.id) FILTER (WHERE s.kode_status = 'dijadwalkan' OR s.kode_status = 'dijadwalkan_ulang') AS total_sesi_dijadwalkan,
      
      COUNT(DISTINCT k.id) FILTER (
        WHERE k.status_kehadiran = TRUE 
        AND s.kode_status = 'selesai'
      ) AS mahasiswa_hadir,
      
      ROUND(AVG(r.rating) FILTER (
        WHERE s.kode_status = 'selesai'
      ), 1) AS rata_rating,
      
      COUNT(r.id) FILTER (
        WHERE s.kode_status = 'selesai'
      ) AS total_rating,
  
      -- Total durasi sesi selesai dalam menit
      SUM(
        EXTRACT(EPOCH FROM (k.jam_selesai - k.jam_mulai)) / 60
      ) FILTER (WHERE s.kode_status = 'selesai') AS total_durasi_selesai_menit
  
    FROM konselor_profil kp
    LEFT JOIN janji_temu jt ON kp.id = jt.preferensi_konselor_id AND jt.deleted_at IS NULL
    LEFT JOIN konseling k ON jt.id = k.janji_temu_id AND k.deleted_at IS NULL
    LEFT JOIN status s ON k.status_id = s.id
    LEFT JOIN rating r ON k.id = r.konseling_id
    WHERE kp.deleted_at IS NULL
    GROUP BY kp.id, kp.nama_lengkap, kp.sipp;
    `);

  // Create a unique index on the materialized view to allow concurrent refresh
  pgm.sql(`
    CREATE UNIQUE INDEX mv_konselor_stats_unique_index ON mv_konselor_stats(konselor_id);
    `);

  // Create the function to refresh the materialized view
  pgm.sql(`
    CREATE OR REPLACE FUNCTION fn_refresh_konselor_stats()
    RETURNS VOID AS $$ 
    BEGIN
      REFRESH MATERIALIZED VIEW CONCURRENTLY mv_konselor_stats;
    END;
    $$ LANGUAGE plpgsql;
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql('DROP FUNCTION IF EXISTS fn_refresh_konselor_stats()');
  pgm.sql('DROP MATERIALIZED VIEW IF EXISTS mv_konselor_stats');
  pgm.sql('DROP INDEX IF EXISTS mv_konselor_stats_unique_index');
};
