/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
    // 1. Table log_verifikasi_mahasiswa
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

    // 2. Index untuk performa
    pgm.createIndex("log_verifikasi_mahasiswa", "mahasiswa_id");
    pgm.createIndex("log_verifikasi_mahasiswa", "created_at");

    // 3. Function untuk log perubahan status verifikasi
    pgm.createFunction(
        "log_mahasiswa_verification_change",
        [],
        {
            language: "plpgsql",
            returns: "TRIGGER",
        },
        `
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
    `
    );

    // 4. Trigger untuk mencatat log verifikasi
    pgm.createTrigger("mahasiswa", "trigger_log_verifikasi_change", {
        when: "AFTER",
        operation: ["UPDATE"],
        level: "ROW",
        function: "log_mahasiswa_verification_change",
    });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
    pgm.dropTrigger("mahasiswa", "trigger_log_verifikasi_change");
    pgm.dropFunction("log_mahasiswa_verification_change");
    pgm.dropTable("log_verifikasi_mahasiswa");
};
