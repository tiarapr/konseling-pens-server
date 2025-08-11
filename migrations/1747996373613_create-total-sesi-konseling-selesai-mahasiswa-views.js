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
        CREATE OR REPLACE VIEW vw_total_sesi_selesai_per_mahasiswa AS
        SELECT
        m.id AS mahasiswa_id,
        m.nama_lengkap AS nama_mahasiswa,
        COUNT(k.id) AS total_sesi_selesai
        FROM konseling k
        JOIN janji_temu jt ON k.janji_temu_id = jt.id
        JOIN mahasiswa m ON jt.nrp = m.nrp
        JOIN status s ON k.status_id = s.id
        WHERE 
        k.deleted_at IS NULL
        AND s.kode_status = 'selesai'
        GROUP BY m.id, m.nama_lengkap;
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.sql(`DROP VIEW IF EXISTS vw_total_sesi_selesai_per_mahasiswa;`);
};
