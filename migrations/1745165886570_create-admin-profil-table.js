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
    pgm.createTable("admin_profil", {
        id: {
            type: "UUID",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        nama_lengkap: {
            type: "VARCHAR(250)",
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

    pgm.createIndex("admin_profil", "nama_lengkap", {
        name: "idx_nama_lengkap_admin_profil",
    });

    pgm.createIndex("admin_profil", "created_at", {
        name: "idx_admin_profil_created_at",
    });

    pgm.createIndex("admin_profil", "created_by", {
        name: "idx_admin_profil_created_by",
    });

    pgm.createIndex("admin_profil", "updated_at", {
        name: "idx_admin_profil_updated_at",
    });

    pgm.createIndex("admin_profil", "deleted_at", {
        name: "idx_admin_profil_deleted_at",
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {

    pgm.dropIndex("admin_profil", "nama_lengkap", {
        name: "idx_nama_lengkap_admin_profil",
    });

    pgm.dropIndex("admin_profil", "created_at", {
        name: "idx_admin_profil_created_at",
    });

    pgm.dropIndex("admin_profil", "created_by", {
        name: "idx_admin_profil_created_by",
    });

    pgm.dropIndex("admin_profil", "updated_at", {
        name: "idx_admin_profil_updated_at",
    });

    pgm.dropIndex("admin_profil", "deleted_at", {
        name: "idx_admin_profil_deleted_at",
    });

    pgm.dropTable('admin_profil');
};
