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
        CREATE TRIGGER trg_rekap_janji_temu_harian
        AFTER INSERT ON janji_temu
        FOR EACH STATEMENT
        EXECUTE FUNCTION fn_rekap_janji_temu_harian();
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.sql(`
        DROP TRIGGER IF EXISTS trg_rekap_janji_temu_harian ON janji_temu;
    `);
};
