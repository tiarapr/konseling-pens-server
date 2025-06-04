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
    pgm.createTable('status_verifikasi', {
        id: {
            type: 'UUID',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        kode_status: {
            type: 'VARCHAR(50)',
            notNull: true,
            unique: true,
        },
        label: {
            type: 'VARCHAR(100)',
            notNull: true,
        },
        warna: {
            type: 'VARCHAR(20)',
            notNull: true,
        },
        urutan: {
            type: 'INT',
            notNull: true,
        },
        is_active: {
            type: 'BOOLEAN',
            notNull: true,
            default: true,
        },
    });

    pgm.sql(`
     INSERT INTO status_verifikasi (kode_status, label, warna, urutan) VALUES
    ('menunggu_verifikasi', 'Menunggu Verifikasi', 'primary', 1), 
    ('revisi_diperlukan', 'Revisi Diperlukan', 'warning', 2),
    ('menunggu_peninjauan', 'Menunggu Peninjauan', 'light', 3),
    ('terverifikasi', 'Terverifikasi', 'success', 4),
    ('ditolak', 'Verifikasi Ditolak', 'error', 5);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
     pgm.sql(`
        DROP TABLE IF EXISTS status_verifikasi;
    `);
};
