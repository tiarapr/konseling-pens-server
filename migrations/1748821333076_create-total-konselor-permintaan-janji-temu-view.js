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
  pgm.sql(`
    CREATE OR REPLACE VIEW vw_total_permintaan_janji_temu_konselor AS
    SELECT
        kp.id AS konselor_id,
        kp.nama_lengkap AS konselor,
        COUNT(DISTINCT jt.id) AS total_permintaan
    FROM konselor_profil kp
    LEFT JOIN janji_temu jt ON kp.id = jt.preferensi_konselor_id
    WHERE jt.deleted_at IS NULL  -- Pastikan hanya janji temu yang tidak dihapus
    GROUP BY kp.id, kp.nama_lengkap
    ORDER BY total_permintaan DESC;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // Drop view jika migrasi di-rollback
  pgm.sql('DROP VIEW IF EXISTS vw_total_permintaan_janji_temu_konselor');
};
