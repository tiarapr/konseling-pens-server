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
    // Drop trigger lama 
    pgm.sql(`
    DROP TRIGGER IF EXISTS trg_validasi_pengajuan_duplikat ON janji_temu;
  `);

    // Buat trigger baru dengan kondisi UPDATE hanya di kolom jadwal
    pgm.sql(`
    CREATE TRIGGER trg_validasi_pengajuan_duplikat
    BEFORE INSERT OR UPDATE OF 
      jadwal_utama_tanggal, jadwal_utama_jam_mulai, jadwal_utama_jam_selesai,
      jadwal_alternatif_tanggal, jadwal_alternatif_jam_mulai, jadwal_alternatif_jam_selesai
    ON janji_temu
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
    // Kembalikan ke trigger awal (kalau rollback)
    pgm.sql(`
    DROP TRIGGER IF EXISTS trg_validasi_pengajuan_duplikat ON janji_temu;
  `);

    pgm.sql(`
    CREATE TRIGGER trg_validasi_pengajuan_duplikat
    BEFORE INSERT OR UPDATE ON janji_temu
    FOR EACH ROW
    EXECUTE FUNCTION fn_validasi_pengajuan_duplikat();
  `);
};
