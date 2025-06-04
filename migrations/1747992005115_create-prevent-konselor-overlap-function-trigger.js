/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
    pgm.sql(`
        CREATE OR REPLACE FUNCTION prevent_konselor_overlap()
        RETURNS trigger AS $$
        BEGIN
        IF EXISTS (
            SELECT 1 FROM konseling
            WHERE
            konselor_profil_id = NEW.konselor_profil_id
            AND tanggal_konseling = NEW.tanggal_konseling
            AND (NEW.jam_mulai, NEW.jam_selesai) OVERLAPS (jam_mulai, jam_selesai)
            AND deleted_at IS NULL
            AND id IS DISTINCT FROM NEW.id
        ) THEN
            RAISE EXCEPTION 'Konselor sudah memiliki jadwal di waktu tersebut.';
        END IF;
        RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER prevent_konselor_overlap
        BEFORE INSERT OR UPDATE ON konseling
        FOR EACH ROW
        EXECUTE FUNCTION prevent_konselor_overlap();
  `);
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
    pgm.sql(`
        DROP TRIGGER IF EXISTS prevent_konselor_overlap ON konseling;
        DROP FUNCTION IF EXISTS prevent_konselor_overlap;
    `);
};
