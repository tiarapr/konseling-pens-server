/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
    pgm.sql(`
        CREATE OR REPLACE FUNCTION fn_get_jadwal_konseling_konselor(p_konselor_id UUID)
        RETURNS TABLE (
        konseling_id UUID,
        tanggal_konseling DATE,
        jam_mulai TIME,
        jam_selesai TIME,
        lokasi VARCHAR,
        status_label VARCHAR,
        warna VARCHAR
        )
        LANGUAGE plpgsql AS $$
        BEGIN
        RETURN QUERY
        SELECT
            k.id,
            k.tanggal_konseling,
            k.jam_mulai,
            k.jam_selesai,
            k.lokasi,
            s.label,
            s.warna
        FROM konseling k
        JOIN status s ON k.status_id = s.id
        WHERE
            k.konselor_profil_id = p_konselor_id
            AND k.deleted_at IS NULL
            AND k.tanggal_konseling >= CURRENT_DATE
        ORDER BY k.tanggal_konseling, k.jam_mulai;
        END;
        $$;
  `);
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
    pgm.sql(`
        DROP FUNCTION IF EXISTS fn_get_jadwal_konseling_konselor;
    `);
};
