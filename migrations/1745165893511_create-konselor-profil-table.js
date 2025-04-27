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
    pgm.createTable("konselor_profil", {
        id: {
          type: "UUID",
          primaryKey: true,
          default: pgm.func("gen_random_uuid()"),
        },
        nip: { 
            type: "VARCHAR(30)", 
            notNull: true 
        },
        nama_lengkap: { 
            type: "VARCHAR(250)", 
            notNull: true 
        },
        spesialisasi: { 
            type: "VARCHAR(150)", 
            notNull: true 
        },
        no_telepon: { 
            type: "VARCHAR(50)", 
            notNull: true 
        },
        user_id: {
             type: "UUID",
            notNull: true,
            references: '"user"(id)',
            onUpdate: "CASCADE",
        },
        created_at: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
        created_by: {
             type: "UUID",
            notNull: true,
            references: '"user"(id)',
            onUpdate: "CASCADE",
        },
        updated_at: {
            type: "timestamp",
            notNull: false,
            default: null,
        },
        updated_by: {
            type: "UUID",
            notNull: false,
            references: '"user"(id)',
            onUpdate: "CASCADE",
        },
        deleted_at: {
            type: "timestamp",
            notNull: false,
            default: null,
        },
        deleted_by: {
            type: "UUID",
            notNull: false,
            references: '"user"(id)',
            onUpdate: "CASCADE",
        },
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('konselor_profil');
};
