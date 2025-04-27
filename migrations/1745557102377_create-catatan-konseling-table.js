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
    pgm.createTable("catatan_konseling", {
        id: {
          type: "UUID",
          primaryKey: true,
          default: pgm.func("gen_random_uuid()"),
        },
        konseling_id: {
            type: "UUID",
            notNull: true,
            references: "konseling(id)",
            onUpdate: "CASCADE",
        },
        deskripsi_masalah: {
            type: "TEXT",
            notNull: true,
        },
        usaha: {
            type: "TEXT",
            notNull: false
        },
        kendala: {
            type: "TEXT",
            notNull: false,
        },
        pencapaian: {
            type: "TEXT",
            notNull: false
        },
        diagnosis: {
            type: "TEXT",
            notNull: false,
        },
        intervensi: {
            type: "TEXT",
            notNull: false,
        },
        tindak_lanjut: {
            type: "TEXT",
            notNull: false,
        },
        konseling_lanjutan: {
            type: "BOOLEAN",
            notNull: true,
        },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
        created_by: {
             type: "UUID",
            notNull: true,
            references: '"user"(id)',
            onUpdate: "CASCADE",
        },
        updated_at: {
            type: "timestamp",
            notNull: false,
            default: null,
        },
        updated_by: {
            type: "UUID",
            notNull: false,
            references: '"user"(id)',
            onUpdate: "CASCADE",
        },
        deleted_at: {
            type: "timestamp",
            notNull: false,
            default: null,
        },
        deleted_by: {
            type: "UUID",
            notNull: false,
            references: '"user"(id)',
            onUpdate: "CASCADE",
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable("catatan_konseling");
};
