/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createTable("janji_temu", {
    id: {
      type: "UUID",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    nomor_tiket: {
      type: "VARCHAR(50)",
      notNull: true,
      unique: true,
    },
    nrp: {
      type: "VARCHAR(15)",
      notNull: true,
      references: "mahasiswa(nrp)",
      onUpdate: "CASCADE",
    },
    status_id: {
      type: "UUID",
      notNull: true,
      references: "status(id)",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    tipe_konsultasi: {
      type: "VARCHAR(20)",
      notNull: true,
    },
    jadwal_utama_tanggal: {
      type: "DATE",
      notNull: true,
    },
    jadwal_utama_jam_mulai: {
      type: "TIME",
      notNull: true,
    },
    jadwal_utama_jam_selesai: {
      type: "TIME",
      notNull: true,
    },
    jadwal_alternatif_tanggal: {
      type: "DATE",
      notNull: true,
    },
    jadwal_alternatif_jam_mulai: {
      type: "TIME",
      notNull: true,
    },
    jadwal_alternatif_jam_selesai: {
      type: "TIME",
      notNull: true,
    },
    tanggal_pengajuan: {
      type: "DATE",
      notNull: true,
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
 */
exports.down = (pgm) => {
  pgm.dropTable("janji_temu");
};
