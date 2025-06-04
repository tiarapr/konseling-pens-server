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
            unique: true,
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
            type: "TIMESTAMP",
            notNull: true,
            default: pgm.func("current_TIMESTAMP")
        },
        created_by: {
            type: "UUID",
            references: '"user"(id)',
            onUpdate: "CASCADE",
            notNull: true,
        },
        updated_at: {
            type: "TIMESTAMP",
            default: null,
        },
        updated_by: {
            type: "UUID",
            references: '"user"(id)',
            onUpdate: "CASCADE",
        },
        deleted_at: {
            type: "TIMESTAMP",
            default: null,
        },
        deleted_by: {
            type: "UUID",
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
