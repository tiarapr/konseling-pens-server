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
        sipp: {
            type: "VARCHAR(30)",
            notNull: true,
            unique: true,
        },
        nama_lengkap: {
            type: "VARCHAR(250)",
            notNull: true
        },
        spesialisasi: {
            type: "VARCHAR(150)",
            notNull: true
        },
        user_id: {
            type: "UUID",
            unique: true,
            notNull: true,
            references: '"user"(id)',
            onUpdate: "CASCADE",
        },
        photo_url: {
            type: "TEXT",
            notNull: false,
            default: null,
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
            notNull: true,
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
        restored_at: {
            type: "TIMESTAMP",
            default: null
        },
        restored_by: {
            type: "UUID",
            references: '"user"(id)',
            onUpdate: 'CASCADE',
        },
    });
    
    pgm.createIndex("konselor_profil", "nama_lengkap", {
        name: "idx_nama_lengkap_in_konselor_profil",
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
