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
    pgm.createTable("role_user", {
        user_id: {
             type: "UUID",
            notNull: true,
            references: '"user"(id)',
            onUpdate: "CASCADE",
        },
        role_id: {
            type: "UUID",
            notNull: true,
            references: "role(id)",
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        },
    });

    pgm.addConstraint("role_user", "pk_role_user", {
        primaryKey: ['user_id', 'role_id'],
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable("role_user");
};
