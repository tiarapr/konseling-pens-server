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
    // Function: Hitung total mahasiswa dalam rentang tanggal
    pgm.sql(`
        CREATE OR REPLACE FUNCTION fn_hitung_total_mahasiswa_janji_temu_dalam_rentang(
        tanggal_mulai DATE,
        tanggal_selesai DATE
        )
        RETURNS INTEGER AS $$
        BEGIN
        RETURN (
            SELECT COUNT(DISTINCT nrp)
            FROM janji_temu
            WHERE
            tanggal_pengajuan BETWEEN tanggal_mulai AND tanggal_selesai
            AND deleted_at IS NULL
        );
        END;
        $$ LANGUAGE plpgsql;
    `);

    // Function: Hitung total mahasiswa per konselor
    pgm.sql(`
            CREATE OR REPLACE FUNCTION fn_hitung_total_mahasiswa_janji_temu_per_konselor(
            konselor_id UUID
            )
            RETURNS INTEGER AS $$
            BEGIN
            RETURN (
                SELECT COUNT(DISTINCT nrp)
                FROM janji_temu
                WHERE preferensi_konselor_id = konselor_id
                AND deleted_at IS NULL
            );
            END;
            $$ LANGUAGE plpgsql;
    `);

    // Function: Hitung total mahasiswa per status
    pgm.sql(`
        CREATE OR REPLACE FUNCTION fn_hitung_total_mahasiswa_janji_temu_per_status(
        status_input status_janji_temu
        )
        RETURNS INTEGER AS $$
        BEGIN
        RETURN (
            SELECT COUNT(DISTINCT nrp)
            FROM janji_temu
            WHERE status = status_input
            AND deleted_at IS NULL
        );
        END;
        $$ LANGUAGE plpgsql;
    `);

    // Function: Hitung total mahasiswa per tipe konsultasi
    pgm.sql(`
        CREATE OR REPLACE FUNCTION fn_hitung_total_mahasiswa_janji_temu_per_tipe(
        tipe tipe_konsultasi
        )
        RETURNS INTEGER AS $$
        BEGIN
        RETURN (
            SELECT COUNT(DISTINCT nrp)
            FROM janji_temu
            WHERE tipe_konsultasi = tipe
            AND deleted_at IS NULL
        );
        END;
        $$ LANGUAGE plpgsql;
    `);

    // View: Ringkasan total mahasiswa per bulan
    pgm.sql(`
        CREATE OR REPLACE VIEW vw_total_mahasiswa_janji_temu_per_bulan AS
        SELECT
        DATE_TRUNC('month', tanggal_pengajuan) AS bulan,
        COUNT(DISTINCT nrp) AS total_mahasiswa
        FROM janji_temu
        WHERE deleted_at IS NULL
        GROUP BY bulan
        ORDER BY bulan DESC;
    `);

    // View: Ringkasan total mahasiswa per tahun
    pgm.sql(`
        CREATE OR REPLACE VIEW vw_total_mahasiswa_janji_temu_per_tahun AS
        SELECT
        DATE_TRUNC('year', tanggal_pengajuan) AS tahun,
        COUNT(DISTINCT nrp) AS total_mahasiswa
        FROM janji_temu
        WHERE deleted_at IS NULL
        GROUP BY tahun
        ORDER BY tahun DESC;
    `);

    // View: Ringkasan total mahasiswa per tipe konsultasi
    pgm.sql(`
        CREATE OR REPLACE VIEW vw_total_mahasiswa_janji_temu_per_tipe_konsultasi AS
        SELECT
        tipe_konsultasi,
        COUNT(DISTINCT nrp) AS total_mahasiswa
        FROM janji_temu
        WHERE deleted_at IS NULL
        GROUP BY tipe_konsultasi;
    `);

    // View: Ringkasan total mahasiswa per status
    pgm.sql(`
        CREATE OR REPLACE VIEW vw_total_mahasiswa_janji_temu_per_status AS
        SELECT
        status,
        COUNT(DISTINCT nrp) AS total_mahasiswa
        FROM janji_temu
        WHERE deleted_at IS NULL
        GROUP BY status;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.sql(`
        DROP FUNCTION IF EXISTS
        fn_hitung_total_mahasiswa_janji_temu_dalam_rentang,
        fn_hitung_total_mahasiswa_janji_temu_per_konselor,
        fn_hitung_total_mahasiswa_janji_temu_per_status,
        fn_hitung_total_mahasiswa_janji_temu_per_tipe;
    `);

    pgm.sql(`
        DROP VIEW IF EXISTS
        vw_total_mahasiswa_janji_temu_per_bulan,
        vw_total_mahasiswa_janji_temu_per_tahun,
        vw_total_mahasiswa_janji_temu_per_tipe_konsultasi,
        vw_total_mahasiswa_janji_temu_per_status;
    `);
};
