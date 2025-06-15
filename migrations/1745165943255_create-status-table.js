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
    // Buat tabel status
    pgm.createTable('status', {
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
            notNull: false,
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

    // Seed data status
    pgm.sql(`
        INSERT INTO status (kode_status, label, warna, urutan) VALUES
        ('dijadwalkan', 'Dijadwalkan', 'info', 1),
        ('berlangsung', 'Berlangsung', 'primary', 2),
        ('selesai', 'Selesai', 'success', 3),
        ('dibatalkan', 'Dibatalkan', 'error', 4),
        ('dijadwalkan_ulang', 'Dijadwalkan Ulang', 'warning', 5),
        ('batal_otomatis', 'Dibatalkan Otomatis', 'dark', 6);
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('status');
};
