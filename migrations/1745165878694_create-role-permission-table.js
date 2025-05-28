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
    pgm.createTable("role_permission", {
        id: {
            type: "UUID",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        role_id: {
            type: "UUID",
            notNull: true,
            references: "role(id)",
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        permission_id: {
            type: "UUID",
            notNull: true,
            references: "permission(id)",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
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
            type: "TIMESTAMP",
            default: null,
        },
        deleted_by: {
            type: "UUID",
            references: '"user"(id)',
            onUpdate: "CASCADE",
        },
    });

    pgm.sql(`
        INSERT INTO role_permission (role_id, permission_id)
        SELECT
            r.id,
            p.id
        FROM role r
        JOIN permission p ON p.name IN ('manage_users', 'manage_roles', 'manage_permissions')
        WHERE r.name = 'master';
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('role_permission');
};
