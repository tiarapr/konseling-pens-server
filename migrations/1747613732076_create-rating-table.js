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
    pgm.createTable('rating', {
        id: {
            type: "UUID",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        konseling_id: {
            type: "UUID",
            unique: true,
            notNull: true,
            references: "konseling(id)",
            onUpdate: "CASCADE",
        },
        rating: {
            type: 'integer',
            notNull: true,
        },
        ulasan: {
            type: 'text',
            notNull: false,
        },
        created_at: {
            type: 'TIMESTAMP',
            notNull: true,
            default: pgm.func('current_TIMESTAMP'),
        },
    });
    
    pgm.createIndex('rating', 'konseling_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('rating');
 };
