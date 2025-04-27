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
    pgm.createTable("user", {
        id: {
          type: "UUID",
          primaryKey: true,
          default: pgm.func("gen_random_uuid()"),
        },
        email: {
            type: "varchar(255)",
            notNull: true,
            unique: true
        },
        password: {
            type: "TEXT",
            notNull: true,
        },
        is_verified: {
            type: "BOOLEAN",
            notNull: true,
            default: false,
        },
        verified_at: {
            type: "timestamp",
            notNull: false,
        },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp")
        },
        updated_at: {
            type: "timestamp",
            notNull: false,
            default: null
        },
        deleted_at: {
            type: "timestamp",
            notNull: false,
            default: null
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('user');
};
