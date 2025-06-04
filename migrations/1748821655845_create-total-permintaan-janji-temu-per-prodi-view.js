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
        CREATE OR REPLACE VIEW total_pengajuan_per_prodi_jenjang_view AS
        SELECT 
            ps.jenjang,
            ps.nama_program_studi,
            COUNT(jt.id) AS total_pengajuan
        FROM janji_temu jt
        JOIN mahasiswa m ON jt.nrp = m.nrp
        JOIN program_studi ps ON m.program_studi_id = ps.id
        WHERE jt.deleted_at IS NULL -- Pastikan hanya pengajuan yang tidak dihapus
        GROUP BY ps.jenjang, ps.nama_program_studi
        ORDER BY ps.jenjang, total_pengajuan DESC;
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.sql('DROP VIEW IF EXISTS total_pengajuan_per_prodi_jenjang_view');
};
