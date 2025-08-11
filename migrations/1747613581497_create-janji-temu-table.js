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

  pgm.createIndex('janji_temu', 'nrp', { name: 'idx_janji_temu_nrp' });

  pgm.createIndex('janji_temu', 'preferensi_konselor_id', { name: 'idx_janji_temu_preferensi_konselor_id' });

  pgm.createIndex('janji_temu', 'status', { name: 'idx_janji_temu_status' });

  pgm.createIndex('janji_temu', ['jadwal_utama_tanggal', 'jadwal_utama_jam_mulai', 'jadwal_utama_jam_selesai'], { name: 'idx_janji_temu_jadwal_utama' });
  
  pgm.createIndex('janji_temu', ['jadwal_alternatif_tanggal', 'jadwal_alternatif_jam_mulai', 'jadwal_alternatif_jam_selesai'], { name: 'idx_janji_temu_jadwal_alternatif' });

  pgm.createIndex('janji_temu', 'tipe_konsultasi', { name: 'idx_janji_temu_tipe_konsultasi' });

  pgm.createIndex('janji_temu', 'tanggal_pengajuan', { name: 'idx_janji_temu_tanggal_pengajuan' });

  pgm.createIndex('janji_temu', ['preferensi_konselor_id', 'status'], { name: 'idx_janji_temu_konselor_status' });

  pgm.createIndex('janji_temu', ['nrp', 'status'], { name: 'idx_janji_temu_nrp_status' });

  // Indeks komposit untuk mencari janji temu berdasarkan tanggal dan status.
  pgm.createIndex('janji_temu', ['jadwal_utama_tanggal', 'jadwal_alternatif_tanggal', 'status'], { name: 'idx_janji_temu_tanggal_status' });

  pgm.createIndex('janji_temu', 'status_changed_at', { name: 'idx_janji_temu_status_changed_at' });

  pgm.createIndex('janji_temu', 'status_changed_by', { name: 'idx_janji_temu_status_changed_by' });
  
  pgm.createIndex('janji_temu', 'created_at', { name: 'idx_janji_temu_created_at' });

  pgm.createIndex('janji_temu', 'created_by', { name: 'idx_janji_temu_created_by' });

  pgm.createIndex('janji_temu', 'updated_at', { name: 'idx_janji_temu_updated_at' });

  pgm.createIndex('janji_temu', 'deleted_at', { name: 'idx_janji_temu_deleted_at' });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  // Drop index first
  pgm.dropIndex('janji_temu', 'nrp', { name: 'idx_janji_temu_nrp' });

  pgm.dropIndex('janji_temu', 'preferensi_konselor_id', { name: 'idx_janji_temu_preferensi_konselor_id' });

  pgm.dropIndex('janji_temu', 'status', { name: 'idx_janji_temu_status' });

  pgm.dropIndex('janji_temu', ['jadwal_utama_tanggal', 'jadwal_utama_jam_mulai', 'jadwal_utama_jam_selesai'], { name: 'idx_janji_temu_jadwal_utama' });
  
  pgm.dropIndex('janji_temu', ['jadwal_alternatif_tanggal', 'jadwal_alternatif_jam_mulai', 'jadwal_alternatif_jam_selesai'], { name: 'idx_janji_temu_jadwal_alternatif' });

  pgm.dropIndex('janji_temu', 'tipe_konsultasi', { name: 'idx_janji_temu_tipe_konsultasi' });

  pgm.dropIndex('janji_temu', 'tanggal_pengajuan', { name: 'idx_janji_temu_tanggal_pengajuan' });

  pgm.dropIndex('janji_temu', ['preferensi_konselor_id', 'status'], { name: 'idx_janji_temu_konselor_status' });

  pgm.dropIndex('janji_temu', ['nrp', 'status'], { name: 'idx_janji_temu_nrp_status' });

  pgm.dropIndex('janji_temu', ['jadwal_utama_tanggal', 'jadwal_alternatif_tanggal', 'status'], { name: 'idx_janji_temu_tanggal_status' });

  pgm.dropIndex('janji_temu', 'status_changed_at', { name: 'idx_janji_temu_status_changed_at' });

  pgm.dropIndex('janji_temu', 'status_changed_by', { name: 'idx_janji_temu_status_changed_by' });
  
  pgm.dropIndex('janji_temu', 'created_at', { name: 'idx_janji_temu_created_at' });

  pgm.dropIndex('janji_temu', 'created_by', { name: 'idx_janji_temu_created_by' });

  pgm.dropIndex('janji_temu', 'updated_at', { name: 'idx_janji_temu_updated_at' });

  pgm.dropIndex('janji_temu', 'deleted_at', { name: 'idx_janji_temu_deleted_at' });

  // Drop table
  pgm.dropTable("janji_temu");

  // Then drop the ENUM types
  pgm.dropType("tipe_konsultasi");
  pgm.dropType("status_janji_temu");
};