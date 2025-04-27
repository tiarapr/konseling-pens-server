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
    pgm.createTable("reset_password_tokens", {
        user_id: {
            type: "UUID",
            notNull: true,
            references: '"user"(id)',
            onUpdate: "CASCADE",
        },
        token: {
            type: "TEXT",
            notNull: true,
            unique: true,
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
        used_at: {
            type: "TIMESTAMP",
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
    pgm.dropTable("reset_password_tokens");
};
