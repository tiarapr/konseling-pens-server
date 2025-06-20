/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
    pgm.sql(`
        CREATE OR REPLACE VIEW vw_jumlah_sesi_per_tanggal_per_konselor AS
        SELECT
        kp.id AS konselor_id,
        kp.nama_lengkap AS nama_konselor,
        k.tanggal_konseling,
        COUNT(*) AS jumlah_sesi
        FROM konseling k
        JOIN konselor_profil kp ON k.konselor_profil_id = kp.id
        WHERE k.deleted_at IS NULL
        GROUP BY kp.id, kp.nama_lengkap, k.tanggal_konseling
        ORDER BY konselor_id, jumlah_sesi DESC;
  `);
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
    pgm.sql(`
        DROP VIEW IF EXISTS vw_jumlah_sesi_per_tanggal_per_konselor;
    `);
};
