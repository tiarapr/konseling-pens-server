/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
    pgm.sql(`
        CREATE OR REPLACE FUNCTION update_status_berlangsung_otomatis()
        RETURNS void AS $$
        BEGIN
        UPDATE konseling
        SET status_id = (
            SELECT id FROM status WHERE kode_status = 'berlangsung' LIMIT 1
        )
        WHERE
            tanggal_konseling = CURRENT_DATE
            AND status_kehadiran = true
            AND deleted_at IS NULL
            AND status_id != (
            SELECT id FROM status WHERE kode_status = 'berlangsung' LIMIT 1
            );
        END;
        $$ LANGUAGE plpgsql;
  `);
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
    pgm.sql(`
        DROP FUNCTION IF EXISTS update_status_berlangsung_otomatis;
    `);
};
