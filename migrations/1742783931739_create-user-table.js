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
            type: "VARCHAR(255)",
            notNull: true,
            unique: true
        },
        phone_number: {
            type: "VARCHAR(15)",
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
            type: "TIMESTAMP",
            notNull: false,
        },
        created_at: {
            type: "TIMESTAMP",
            notNull: true,
            default: pgm.func("CURRENT_TIMESTAMP")
        },
        created_by: {
            type: "UUID",
            references: '"user"(id)',
            onUpdate: "CASCADE",
            notNull: false,
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
            type: "timestamp",
            default: null,
        },
        deleted_by: {
            type: "UUID",
            references: '"user"(id)',
            onUpdate: "CASCADE",
        },
        restored_at: {
            type: "timestamp",
            default: null
        },
        restored_by: {
            type: "UUID",
            references: '"user"(id)',
            onUpdate: "CASCADE",
        },
    });

    pgm.createIndex('user', 'created_at', { name: 'idx_user_created_at' });
    pgm.createIndex('user', 'verified_at', { name: 'idx_user_verified_at' });
    pgm.createIndex("user", "is_verified", { name: 'idx_user_is_verified' });
    pgm.createIndex('user', 'deleted_at', { name: 'idx_user_deleted_at' });
    pgm.createIndex('user', 'restored_at', { name: 'idx_user_restored_at' });

    pgm.addConstraint('user', 'email_format_check', {
        check: "email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'",
    });

    pgm.addConstraint('user', 'phone_format_check', {
        check: "phone_number ~ '^[1-9][0-9]{4,14}$'",
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropIndex('user', 'created_at', { name: 'idx_user_created_at' });
    pgm.dropIndex('user', 'verified_at', { name: 'idx_user_verified_at' });
    pgm.dropIndex('user', 'is_verified', { name: 'idx_user_is_verified' });
    pgm.dropIndex('user', 'deleted_at', { name: 'idx_user_deleted_at' });
    pgm.dropIndex('user', 'restored_at', { name: 'idx_user_restored_at' });

    pgm.dropTable('user');
};
