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
        CREATE OR REPLACE FUNCTION rekap_janji_temu()
            RETURNS TABLE (
            total BIGINT,
            total_dikonfirmasi BIGINT,
            total_ditolak BIGINT,
            total_menunggu_konfirmasi BIGINT
        ) AS $$
        BEGIN
        RETURN QUERY
        SELECT
            COUNT(*) FILTER (WHERE deleted_at IS NULL) AS total,
            COUNT(*) FILTER (WHERE status = 'dikonfirmasi' AND deleted_at IS NULL) AS total_dikonfirmasi,
            COUNT(*) FILTER (WHERE status = 'ditolak' AND deleted_at IS NULL) AS total_ditolak,
            COUNT(*) FILTER (WHERE status = 'menunggu_konfirmasi' AND deleted_at IS NULL) AS total_menunggu_konfirmasi
        FROM janji_temu;
        END;
        $$ LANGUAGE plpgsql;
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.sql(`
        DROP FUNCTION IF EXISTS rekap_janji_temu;
    `);
};
