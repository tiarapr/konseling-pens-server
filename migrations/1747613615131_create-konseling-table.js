/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
    // Buat tabel konseling
    pgm.createTable("konseling", {
        id: {
            type: "UUID",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        janji_temu_id: {
            type: "UUID",
            notNull: true,
            references: "janji_temu(id)",
            onUpdate: "CASCADE",
        },
        tanggal_konseling: {
            type: "DATE",
            notNull: true,
        },
        jam_mulai: {
            type: "TIME",
            notNull: true,
        },
        jam_selesai: {
            type: "TIME",
            notNull: true,
        },
        konselor_profil_id: {
            type: "UUID",
            notNull: false,
            references: "konselor_profil(id)",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        lokasi: {
            type: "VARCHAR(255)",
            notNull: false,
        },
        status_id: {
            type: "UUID",
            notNull: true,
            references: "status(id)",
            onUpdate: "CASCADE",
        },
        status_kehadiran: {
            type: "BOOLEAN",
            notNull: false,
            default: null,
        },
        tanggal_konfirmasi: {
            type: "DATE",
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
    });

    pgm.createIndex('konseling', 'janji_temu_id', { name: 'idx_janji_temu_id' });
    pgm.createIndex('konseling', 'konselor_profil_id', { name: 'idx_konselor_profil_id' });
    pgm.createIndex('konseling', 'status_id', { name: 'idx_konseling_status_id' });
    pgm.createIndex('konseling', 'tanggal_konseling', { name: 'idx_konseling_tanggal' });
    pgm.createIndex('konseling', ['tanggal_konseling', 'jam_mulai', 'jam_selesai'], {
        name: 'idx_konseling_jadwal',
    });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
    pgm.dropTable("konseling");
};
