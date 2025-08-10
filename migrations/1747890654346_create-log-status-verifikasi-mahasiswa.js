/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
    pgm.createTable("log_verifikasi_mahasiswa", {
        id: {
            type: "UUID",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        mahasiswa_id: {
            type: "UUID",
            notNull: true,
            references: "mahasiswa(id)",
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        status_verifikasi_id_old: {
            type: "UUID",
            notNull: true,
            references: "status_verifikasi(id)",
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        status_verifikasi_id_new: {
            type: "UUID",
            notNull: true,
            references: "status_verifikasi(id)",
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        catatan_verifikasi: {
            type: "TEXT",
            notNull: false,
        },
        verified_by: {
            type: "UUID",
            notNull: true,
            references: '"user"(id)',
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        }
    });

    pgm.createIndex("log_verifikasi_mahasiswa", "mahasiswa_id", { name: "idx_log_verifikasi_mahasiswa_mahasiswa_id" });
    pgm.createIndex("log_verifikasi_mahasiswa", "status_verifikasi_id_old", { name: "idx_log_verifikasi_mahasiswa_status_old" });
    pgm.createIndex("log_verifikasi_mahasiswa", "status_verifikasi_id_new", { name: "idx_log_verifikasi_mahasiswa_status_new" });
    pgm.createIndex("log_verifikasi_mahasiswa", "verified_by", { name: "idx_log_verifikasi_mahasiswa_verified_by" });
    pgm.createIndex("log_verifikasi_mahasiswa", "created_at", { name: "idx_log_verifikasi_mahasiswa_created_at" });
    pgm.createIndex("log_verifikasi_mahasiswa", ["mahasiswa_id", "created_at"], { name: "idx_log_verifikasi_mahasiswa_mahasiswa_id_created_at" });
    pgm.createIndex("log_verifikasi_mahasiswa", ["status_verifikasi_id_new", "created_at"], { name: "idx_log_verifikasi_mahasiswa_status_new_created_at" });

    // Function untuk log perubahan status verifikasi (as SQL)
    pgm.sql(`
        CREATE OR REPLACE FUNCTION fn_log_mahasiswa_verification_change()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.status_verifikasi_id <> OLD.status_verifikasi_id THEN
                INSERT INTO log_verifikasi_mahasiswa (
                    mahasiswa_id,
                    status_verifikasi_id_old,
                    status_verifikasi_id_new,
                    catatan_verifikasi,
                    verified_by
                ) VALUES (
                    NEW.id,
                    OLD.status_verifikasi_id,
                    NEW.status_verifikasi_id,
                    NEW.catatan_verifikasi,
                    NEW.verified_by
                );
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);

    // Trigger untuk mencatat log verifikasi (as SQL)
    pgm.sql(`
        CREATE TRIGGER trg_log_verifikasi_change
        AFTER UPDATE ON mahasiswa
        FOR EACH ROW
        EXECUTE FUNCTION fn_log_mahasiswa_verification_change();
    `);
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
    pgm.sql(`DROP TRIGGER IF EXISTS trg_log_verifikasi_change ON mahasiswa`);
    pgm.sql(`DROP FUNCTION IF EXISTS fn_log_mahasiswa_verification_change`);

    // Drop indexes first
    pgm.dropIndex("log_verifikasi_mahasiswa", "mahasiswa_id", { name: "idx_log_verifikasi_mahasiswa_mahasiswa_id" });
    pgm.dropIndex("log_verifikasi_mahasiswa", "created_at", { name: "idx_log_verifikasi_mahasiswa_created_at" });
    pgm.dropIndex("log_verifikasi_mahasiswa", "status_verifikasi_id_old", { name: "idx_log_verifikasi_mahasiswa_status_old" });
    pgm.dropIndex("log_verifikasi_mahasiswa", "status_verifikasi_id_new", { name: "idx_log_verifikasi_mahasiswa_status_new" });
    pgm.dropIndex("log_verifikasi_mahasiswa", "verified_by", { name: "idx_log_verifikasi_mahasiswa_verified_by" });
    pgm.dropIndex("log_verifikasi_mahasiswa", ["mahasiswa_id", "created_at"], { name: "idx_log_verifikasi_mahasiswa_mahasiswa_id_created_at" });
    pgm.dropIndex("log_verifikasi_mahasiswa", ["status_verifikasi_id_new", "created_at"], { name: "idx_log_verifikasi_mahasiswa_status_new_created_at" });

    // Then drop the table
    pgm.dropTable("log_verifikasi_mahasiswa");
};