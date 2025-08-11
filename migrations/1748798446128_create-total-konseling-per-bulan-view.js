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
         CREATE OR REPLACE VIEW vw_total_konseling_per_bulan_per_status AS
    SELECT
      DATE_TRUNC('month', k.tanggal_konseling)::date AS bulan,
      s.kode_status,
      s.label AS status_label,
      s.warna AS warna_status,
      COUNT(*)::integer AS total
    FROM konseling k
    JOIN status s ON k.status_id = s.id
    WHERE k.deleted_at IS NULL
    GROUP BY bulan, s.kode_status, s.label, s.warna, s.urutan
    ORDER BY bulan, s.urutan;
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
     pgm.sql('DROP VIEW IF EXISTS vw_total_konseling_per_bulan_per_status;');
};
