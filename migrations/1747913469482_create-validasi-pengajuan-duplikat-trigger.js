/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
    pgm.sql(`
    CREATE OR REPLACE FUNCTION fn_validasi_pengajuan_duplikat()
    RETURNS TRIGGER AS $$
    DECLARE
      durasi INTERVAL;
      today DATE := CURRENT_DATE;
      batas_max DATE := CURRENT_DATE + INTERVAL '30 days';
    BEGIN
      -- Validasi tanggal harus lebih dari hari ini dan maksimal 30 hari ke depan
      IF NEW.jadwal_utama_tanggal <= today OR NEW.jadwal_utama_tanggal > batas_max THEN
        RAISE EXCEPTION 'Jadwal utama harus antara besok hingga 30 hari ke depan';
      END IF;
      IF NEW.jadwal_alternatif_tanggal <= today OR NEW.jadwal_alternatif_tanggal > batas_max THEN
        RAISE EXCEPTION 'Jadwal alternatif harus antara besok hingga 30 hari ke depan';
      END IF;

      -- Validasi durasi maksimal berdasarkan tipe_konsultasi
      durasi := NEW.jadwal_utama_jam_selesai - NEW.jadwal_utama_jam_mulai;
      IF NEW.tipe_konsultasi = 'online' AND durasi > INTERVAL '30 minutes' THEN
        RAISE EXCEPTION 'Durasi konsultasi online maksimal 30 menit';
      ELSIF NEW.tipe_konsultasi = 'offline' AND durasi > INTERVAL '60 minutes' THEN
        RAISE EXCEPTION 'Durasi konsultasi offline maksimal 60 menit';
      END IF;

      -- Jadwal utama vs jadwal utama
      IF EXISTS (
        SELECT 1 FROM janji_temu jt
        WHERE jt.deleted_at IS NULL
        AND jt.jadwal_utama_tanggal = NEW.jadwal_utama_tanggal
        AND (
          (NEW.jadwal_utama_jam_mulai, NEW.jadwal_utama_jam_selesai)
          OVERLAPS
          (jt.jadwal_utama_jam_mulai, jt.jadwal_utama_jam_selesai)
        )
      ) THEN
        RAISE EXCEPTION 'Sudah ada janji temu lain pada tanggal % (jadwal utama) yang bentrok dengan jadwal utama ini', NEW.jadwal_utama_tanggal;
      END IF;

      -- Jadwal alternatif vs jadwal utama
      IF EXISTS (
        SELECT 1 FROM janji_temu jt
        WHERE jt.deleted_at IS NULL
        AND jt.jadwal_utama_tanggal = NEW.jadwal_alternatif_tanggal
        AND (
          (NEW.jadwal_alternatif_jam_mulai, NEW.jadwal_alternatif_jam_selesai)
          OVERLAPS
          (jt.jadwal_utama_jam_mulai, jt.jadwal_utama_jam_selesai)
        )
      ) THEN
        RAISE EXCEPTION 'Sudah ada janji temu lain pada tanggal % (jadwal utama) yang bentrok dengan jadwal alternatif ini', NEW.jadwal_alternatif_tanggal;
      END IF;

      -- Jadwal alternatif vs jadwal alternatif
      IF EXISTS (
        SELECT 1 FROM janji_temu jt
        WHERE jt.deleted_at IS NULL
        AND jt.jadwal_alternatif_tanggal = NEW.jadwal_alternatif_tanggal
        AND (
          (NEW.jadwal_alternatif_jam_mulai, NEW.jadwal_alternatif_jam_selesai)
          OVERLAPS
          (jt.jadwal_alternatif_jam_mulai, jt.jadwal_alternatif_jam_selesai)
        )
      ) THEN
        RAISE EXCEPTION 'Sudah ada janji temu lain pada tanggal % (jadwal alternatif) yang bentrok dengan jadwal alternatif ini', NEW.jadwal_alternatif_tanggal;
      END IF;

      -- Jadwal utama vs jadwal alternatif
      IF EXISTS (
        SELECT 1 FROM janji_temu jt
        WHERE jt.deleted_at IS NULL
        AND jt.jadwal_alternatif_tanggal = NEW.jadwal_utama_tanggal
        AND (
          (NEW.jadwal_utama_jam_mulai, NEW.jadwal_utama_jam_selesai)
          OVERLAPS
          (jt.jadwal_alternatif_jam_mulai, jt.jadwal_alternatif_jam_selesai)
        )
      ) THEN
        RAISE EXCEPTION 'Sudah ada janji temu lain pada tanggal % (jadwal alternatif) yang bentrok dengan jadwal utama ini', NEW.jadwal_utama_tanggal;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

    pgm.sql(`
    CREATE TRIGGER trg_validasi_pengajuan_duplikat
    BEFORE INSERT OR UPDATE ON janji_temu
    FOR EACH ROW
    EXECUTE FUNCTION fn_validasi_pengajuan_duplikat();
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
    pgm.sql(`
    DROP TRIGGER IF EXISTS trg_validasi_pengajuan_duplikat ON janji_temu;
  `);
    pgm.sql(`
    DROP FUNCTION IF EXISTS fn_validasi_pengajuan_duplikat;
  `);
};
