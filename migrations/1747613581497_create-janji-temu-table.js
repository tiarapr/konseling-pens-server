/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createType('tipe_konsultasi', ['online', 'offline']);

  pgm.createType('status_janji_temu', [
    'menunggu_konfirmasi',
    'dikonfirmasi',
    'ditolak',
  ]);

  pgm.createTable('janji_temu', {
    id: {
      type: 'UUID',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    nomor_tiket: {
      type: 'VARCHAR(50)',
      notNull: true,
      unique: true,
    },
    nrp: {
      type: 'VARCHAR(15)',
      notNull: true,
      references: 'mahasiswa(nrp)',
      onUpdate: 'CASCADE',
    },
    tipe_konsultasi: {
      type: 'tipe_konsultasi',
      notNull: true,
    },
    preferensi_konselor_id: {
      type: "UUID",
      notNull: false,
      references: "konselor_profil(id)",
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
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
      type: 'DATE',
      notNull: true,
    },
    status: {
      type: 'status_janji_temu',
      notNull: true,
      default: 'menunggu_konfirmasi',
    },
    status_changed_at: {
      type: 'TIMESTAMP',
    },
    status_changed_by: {
      type: 'UUID',
      references: '"user"(id)',
      onUpdate: 'CASCADE',
    },
    alasan_penolakan: {
      type: 'TEXT',
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

  // Add to your up migration after table creation
  pgm.createIndex('janji_temu', 'nrp');
  pgm.createIndex('janji_temu', 'preferensi_konselor_id');
  pgm.createIndex('janji_temu', 'status');
  pgm.createIndex('janji_temu', ['jadwal_utama_tanggal', 'jadwal_utama_jam_mulai', 'jadwal_utama_jam_selesai']);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  pgm.dropTable("janji_temu");
   // Then drop the ENUM types
  pgm.dropType("tipe_konsultasi");
  pgm.dropType("status_janji_temu");
};
