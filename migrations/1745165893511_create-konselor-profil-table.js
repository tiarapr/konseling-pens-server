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
        name: "idx_konselor_profil_nama_lengkap", 
    });

    pgm.createIndex("konselor_profil", "spesialisasi", {
        name: "idx_konselor_profil_spesialisasi",
    });

    pgm.createIndex("konselor_profil", "created_at", {
        name: "idx_konselor_profil_created_at",
    });

    pgm.createIndex("konselor_profil", "created_by", {
        name: "idx_konselor_profil_created_by",
    });

    pgm.createIndex("konselor_profil", "updated_at", {
        name: "idx_konselor_profil_updated_at",
    });

    pgm.createIndex("konselor_profil", "deleted_at", {
        name: "idx_konselor_profil_deleted_at",
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropIndex("konselor_profil", "nama_lengkap", {
        name: "idx_konselor_profil_nama_lengkap", 
    });

    pgm.dropIndex("konselor_profil", "spesialisasi", {
        name: "idx_konselor_profil_spesialisasi",
    });

    pgm.dropIndex("konselor_profil", "created_at", {
        name: "idx_konselor_profil_created_at",
    });

    pgm.dropIndex("konselor_profil", "created_by", {
        name: "idx_konselor_profil_created_by",
    });

    pgm.dropIndex("konselor_profil", "updated_at", {
        name: "idx_konselor_profil_updated_at",
    });

    pgm.dropIndex("konselor_profil", "deleted_at", {
        name: "idx_konselor_profil_deleted_at",
    });

    pgm.dropTable('konselor_profil');
};