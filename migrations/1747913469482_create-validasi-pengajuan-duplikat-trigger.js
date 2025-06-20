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
        CREATE OR REPLACE FUNCTION fn_validasi_pengajuan_duplikat()
        RETURNS TRIGGER AS $$
        BEGIN
        IF EXISTS (
            SELECT 1 FROM janji_temu jt
            WHERE jt.nrp = NEW.nrp
            AND jt.jadwal_utama_tanggal = NEW.jadwal_utama_tanggal
            AND jt.deleted_at IS NULL
        ) THEN
            RAISE EXCEPTION 'Mahasiswa dengan NRP % sudah mengajukan janji temu pada tanggal %',
            NEW.nrp, NEW.jadwal_utama_tanggal;
        END IF;

        RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);

    pgm.sql(`
        CREATE TRIGGER trg_validasi_pengajuan_duplikat
        BEFORE INSERT ON janji_temu
        FOR EACH ROW
        EXECUTE FUNCTION fn_validasi_pengajuan_duplikat();
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.sql(`
        DROP TRIGGER IF EXISTS trg_validasi_pengajuan_duplikat ON janji_temu;
    `);

     pgm.sql(`
        DROP FUNCTION IF EXISTS fn_validasi_pengajuan_duplikat;
    `);
};
