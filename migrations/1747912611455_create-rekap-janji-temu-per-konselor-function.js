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
        CREATE OR REPLACE FUNCTION rekap_janji_temu_per_konselor()
        RETURNS TABLE (
        konselor_id UUID,
        nama_konselor TEXT,
        total BIGINT
        ) AS $$
        BEGIN
        RETURN QUERY
        SELECT 
            kp.id,
            kp.nama_lengkap,
            COUNT(jt.*) AS total
        FROM janji_temu jt
        JOIN konselor_profil kp ON jt.preferensi_konselor_id = kp.id
        WHERE jt.deleted_at IS NULL
        GROUP BY kp.id, kp.nama_lengkap;
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
        DROP FUNCTION IF EXISTS rekap_janji_temu_per_konselor;
    `);
 };
