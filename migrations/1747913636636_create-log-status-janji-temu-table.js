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
    pgm.createTable('log_status_janji_temu', {
        id: {
            type: 'UUID',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        janji_temu_id: {
            type: 'UUID',
            notNull: true,
            references: 'janji_temu(id)',
            onDelete: 'CASCADE',
        },
        old_status: {
            type: 'status_janji_temu',
            notNull: true,
        },
        new_status: {
            type: 'status_janji_temu',
            notNull: true,
        },
        changed_at: {
            type: 'TIMESTAMP',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        changed_by: {
            type: 'UUID',
            references: '"user"(id)',
            notNull: true,
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => { 
    pgm.dropTable('log_status_janji_temu');
};
