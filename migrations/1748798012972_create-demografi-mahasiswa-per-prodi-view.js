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
    CREATE VIEW vw_demografi_mahasiswa_per_prodi AS
    SELECT 
        d.name AS departemen,
        ps.jenjang,
        ps.nama_program_studi,
        COUNT(m.id)::integer AS total_mahasiswa
    FROM mahasiswa m
    JOIN program_studi ps ON m.program_studi_id = ps.id
    JOIN departement d ON ps.departement_id = d.id
    WHERE m.is_active = true AND m.deleted_at IS NULL
    GROUP BY d.name, ps.jenjang, ps.nama_program_studi
    ORDER BY d.name, ps.nama_program_studi;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.sql('DROP VIEW IF EXISTS vw_demografi_mahasiswa_per_prodi;');
};
