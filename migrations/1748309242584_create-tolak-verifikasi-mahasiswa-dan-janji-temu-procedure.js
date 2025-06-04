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
            p_status_verifikasi_id UUID,     -- ID status 'ditolak'
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
        BEGIN
            -- Ambil NRP mahasiswa
            SELECT nrp INTO v_nrp FROM mahasiswa WHERE id = p_mahasiswa_id AND deleted_at IS NULL;

            IF v_nrp IS NULL THEN
                RAISE EXCEPTION 'Mahasiswa tidak ditemukan';
            END IF;

            -- Update status verifikasi mahasiswa menjadi 'ditolak'
            UPDATE mahasiswa
            SET status_verifikasi_id = p_status_verifikasi_id,
                catatan_verifikasi = p_catatan_verifikasi,
                verified_at = p_verified_at,
                verified_by = p_verified_by,
                updated_at = NOW(),
                updated_by = p_updated_by
            WHERE id = p_mahasiswa_id AND deleted_at IS NULL;

            -- Update semua janji temu mahasiswa tsb yang belum ditolak menjadi 'ditolak'
            UPDATE janji_temu
            SET status = 'ditolak',
                status_changed_at = NOW(),
                status_changed_by = p_status_changed_by,
                alasan_penolakan = COALESCE(p_alasan_penolakan, 'Pengajuan ditolak karena status verifikasi mahasiswa ditolak'),
                updated_at = NOW(),
                updated_by = p_updated_by
            WHERE nrp = v_nrp
            AND status != 'ditolak'
            AND deleted_at IS NULL;
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
            UUID, UUID, TEXT, TIMESTAMP, UUID, TEXT, UUID, UUID
        );
    `);
};
