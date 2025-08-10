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

    pgm.createIndex('rating', 'rating', {
        name: 'idx_rating_rating',
    });

    pgm.createIndex('rating', 'created_at', {
        name: 'idx_rating_created_at',
    });

    // Indeks komposit untuk mencari rating berdasarkan rating dan waktu pembuatan.
    // Misalnya, "menampilkan semua rating 5-bintang terbaru".
    pgm.createIndex('rating', ['rating', 'created_at'], {
        name: 'idx_rating_rating_created_at',
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
*/
exports.down = (pgm) => {
    pgm.dropIndex('rating', 'rating', {
        name: 'idx_rating_rating',
    });

    pgm.dropIndex('rating', 'created_at', {
        name: 'idx_rating_created_at',
    });

    pgm.dropIndex('rating', ['rating', 'created_at'], {
        name: 'idx_rating_rating_created_at',
    });

    pgm.dropTable('rating');
};