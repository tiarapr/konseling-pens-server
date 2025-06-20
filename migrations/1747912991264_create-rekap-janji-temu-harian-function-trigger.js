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
        CREATE OR REPLACE FUNCTION fn_rekap_janji_temu_harian()
        RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO log_rekap_janji_temu_harian(tanggal, total, dikonfirmasi, ditolak, menunggu_konfirmasi)
            SELECT
                CURRENT_DATE,
                COUNT(*) FILTER (WHERE deleted_at IS NULL),
                COUNT(*) FILTER (WHERE status = 'dikonfirmasi' AND deleted_at IS NULL),
                COUNT(*) FILTER (WHERE status = 'ditolak' AND deleted_at IS NULL),
                COUNT(*) FILTER (WHERE status = 'menunggu_konfirmasi' AND deleted_at IS NULL)
            FROM janji_temu
            ON CONFLICT (tanggal)
            DO UPDATE SET
                total = EXCLUDED.total,
                dikonfirmasi = EXCLUDED.dikonfirmasi,
                ditolak = EXCLUDED.ditolak,
                menunggu_konfirmasi = EXCLUDED.menunggu_konfirmasi;

            RETURN NEW;
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
        DROP FUNCTION IF EXISTS fn_rekap_janji_temu_harian;
    `);
};
