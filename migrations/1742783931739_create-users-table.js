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
    pgm.createTable("users", {
        user_id: {
            type: "VARCHAR(50)",
            primaryKey: true,
        },
        user_email: {
            type: "varchar(255)",
            notNull: true,
            unique: true
        },
        user_password: {
            type: "TEXT",
            notNull: true,
        },
        user_role_id: {
            type: "VARCHAR(50)",
            references: "roles(role_id)",
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp")
        },
        updated_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp")
        },
        deleted_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp")
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('roles');
};
