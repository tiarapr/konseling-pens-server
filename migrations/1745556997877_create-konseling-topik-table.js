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
    pgm.createTable("konseling_topik", {
        id: {
          type: "UUID",
          primaryKey: true,
          default: pgm.func("gen_random_uuid()"),
        },
        konseling_id: {
            type: "UUID",
            notNull: true,
            references: "konseling(id)",
            onUpdate: 'CASCADE',
        },
        topik_id: {
            type: "UUID",
            notNull: true,
            references: "topik(id)",
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
    pgm.dropTable("konseling_topik");
};
