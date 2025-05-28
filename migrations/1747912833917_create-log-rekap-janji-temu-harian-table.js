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
    pgm.createTable('log_rekap_janji_temu_harian', {
        tanggal: {
            type: 'DATE',
            primaryKey: true,
        },
        total: {
            type: 'BIGINT',
        },
        dikonfirmasi: {
            type: 'BIGINT',
        },
        ditolak: {
            type: 'BIGINT',
        },
        menunggu_konfirmasi: {
            type: 'BIGINT',
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('log_rekap_janji_temu_harian');
};
