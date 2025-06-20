/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
    pgm.sql(`
        CREATE OR REPLACE VIEW vw_statistik_kehadiran_per_mahasiswa AS
        SELECT
        m.id AS mahasiswa_id,
        m.nama_lengkap AS nama_mahasiswa,
        COUNT(k.id) AS total_sesi,
        COUNT(*) FILTER (WHERE k.status_kehadiran = true) AS hadir,
        COUNT(*) FILTER (WHERE k.status_kehadiran = false) AS tidak_hadir,
        ROUND(
            100.0 * COUNT(*) FILTER (WHERE k.status_kehadiran = true) / NULLIF(COUNT(k.id), 0),
            2
        ) AS persen_kehadiran
        FROM konseling k
        JOIN janji_temu jt ON k.janji_temu_id = jt.id
        JOIN mahasiswa m ON jt.nrp = m.nrp
        WHERE k.deleted_at IS NULL
        GROUP BY m.id, m.nama_lengkap;
  `);
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
    pgm.sql(`
        DROP VIEW IF EXISTS vw_statistik_kehadiran_per_mahasiswa;
    `);
};
