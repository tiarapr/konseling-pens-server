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
    pgm.createTable("konseling", {
        id: {
          type: "UUID",
          primaryKey: true,
          default: pgm.func("gen_random_uuid()"),
        },
        janji_temu_id: {
            type: "UUID",
            notNull: true,
            references: "janji_temu(id)",
            onUpdate: "CASCADE",
        },
        tanggal_konseling: {
            type: "DATE",
            notNull: true,
        },
        jam_mulai: {
            type: "TIME",
            notNull: true,
        },
        jam_selesai: {
            type: "TIME",
            notNull: true,
        },
        status_kehadiran: {
            type: "BOOLEAN",
            notNull: false,
            default: null,
        },
        tanggal_konfirmasi: {
            type: "DATE",
            notNull: false,
            default: null,
        },
        status_id: {
            type: "UUID",
            notNull: true,
            references: "status(id)",
            onUpdate: "CASCADE",
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
    pgm.dropTable("konseling");
};
