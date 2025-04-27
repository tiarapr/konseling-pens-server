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
    pgm.createTable("authentication", {
        id: {
          type: "UUID",
          primaryKey: true,
          default: pgm.func("gen_random_uuid()"),
        },
        user_id: {
             type: "UUID",
            notNull: true,
            references: '"user"(id)',
            onUpdate: "CASCADE",
        },
        token: {
            type: "TEXT",
            notNull: true,
        },
        ip_address: {
            type: "varchar(45)",
            notNull: false,
        },
        user_agent: {
            type: "TEXT",
            notNull: false,
        },
        created_at: {
            type: "TIMESTAMP",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
        expires_at: {
            type: "TIMESTAMP",
            notNull: true,
        },
        is_revoked: {
            type: "BOOLEAN",
            notNull: true,
            default: false,
        },
        revoked_at: {
            type: "TIMESTAMP",
            notNull: false,
            default: null,
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable("authentication");
};
