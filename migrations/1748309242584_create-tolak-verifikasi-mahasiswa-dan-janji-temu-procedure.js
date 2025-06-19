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
        CREATE OR REPLACE PROCEDURE tolak_verifikasi_mahasiswa_dan_janji_temu(
            p_mahasiswa_id UUID,
            p_catatan_verifikasi TEXT,
            p_verified_at TIMESTAMP,
            p_verified_by UUID,
            p_alasan_penolakan TEXT,
            p_status_changed_by UUID,
            p_updated_by UUID
        )
        LANGUAGE plpgsql
        AS $$
        DECLARE
            v_nrp VARCHAR(15);
            v_mahasiswa_exists BOOLEAN;
            v_status_ditolak_id UUID; -- Variable to hold the UUID of 'ditolak' status
        BEGIN
            -- Get the ID for the 'ditolak' status from the status_verifikasi table
            SELECT id INTO v_status_ditolak_id FROM status_verifikasi WHERE kode_status = 'ditolak' AND is_active = TRUE;

            -- Check if the 'ditolak' status exists
            IF v_status_ditolak_id IS NULL THEN
                RAISE EXCEPTION 'Status verifikasi "ditolak" tidak ditemukan atau tidak aktif di tabel status_verifikasi.';
            END IF;

            -- Check if the student exists before proceeding
            SELECT EXISTS (SELECT 1 FROM mahasiswa WHERE id = p_mahasiswa_id AND deleted_at IS NULL) INTO v_mahasiswa_exists;

            IF NOT v_mahasiswa_exists THEN
                RAISE EXCEPTION 'Mahasiswa dengan ID % tidak ditemukan atau sudah dihapus.', p_mahasiswa_id;
            END IF;

            -- Get NRP of the student
            SELECT nrp INTO v_nrp
            FROM mahasiswa
            WHERE id = p_mahasiswa_id AND deleted_at IS NULL;

            -- Update student verification status to 'ditolak' (rejected)
            UPDATE mahasiswa
            SET
                status_verifikasi_id = v_status_ditolak_id, -- Use the dynamically fetched ID
                catatan_verifikasi = p_catatan_verifikasi,
                verified_at = p_verified_at,
                verified_by = p_verified_by,
                updated_at = NOW(),
                updated_by = p_updated_by
            WHERE
                id = p_mahasiswa_id
                AND deleted_at IS NULL;

            -- Update all of the student's appointments that are not already 'ditolak' (rejected) to 'ditolak'
            -- The 'status' column in janji_temu is of type status_janji_temu (ENUM),
            -- so 'ditolak' directly refers to the ENUM value.
            UPDATE janji_temu
            SET
                status = 'ditolak', -- Refers to the ENUM value 'ditolak'
                status_changed_at = NOW(),
                status_changed_by = p_status_changed_by,
                alasan_penolakan = COALESCE(p_alasan_penolakan, 'Pengajuan janji temu ditolak karena status verifikasi mahasiswa ditolak.'),
                updated_at = NOW(),
                updated_by = p_updated_by
            WHERE
                nrp = v_nrp
                AND status != 'ditolak' -- Only update if not already rejected
                AND deleted_at IS NULL;

            RAISE NOTICE 'Verifikasi mahasiswa ID % berhasil ditolak dan janji temu terkait diperbarui.', p_mahasiswa_id;
        END;
        $$;
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.sql(`
        DROP PROCEDURE IF EXISTS tolak_verifikasi_mahasiswa_dan_janji_temu(
            UUID, TEXT, TIMESTAMP, UUID, TEXT, UUID, UUID
        );
    `);
};
