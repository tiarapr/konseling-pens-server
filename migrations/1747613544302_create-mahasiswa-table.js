/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable('mahasiswa', {
    id: {
      type: 'UUID',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    nrp: { type: 'VARCHAR(15)', notNull: true, unique: true },
    nama_lengkap: { type: 'VARCHAR(250)', notNull: true },
    program_studi_id: {
      type: 'UUID',
      notNull: true,
      references: 'program_studi(id)',
      onUpdate: 'CASCADE',
    },
    tanggal_lahir: { type: 'DATE', notNull: true },
    jenis_kelamin: { type: 'CHAR(1)', notNull: true },
    ktm_url: { type: 'TEXT', notNull: true },
    user_id: {
      type: 'UUID',
      notNull: true,
      unique: true,
      references: '"user"(id)',
      onUpdate: 'CASCADE',
    },
    status_verifikasi_id: {
      type: 'UUID',
      notNull: true,
      references: 'status_verifikasi(id)',
      onUpdate: 'CASCADE',
    },
    catatan_verifikasi: { type: 'TEXT', default: null },
    verified_at: { type: 'TIMESTAMP' },
    verified_by: {
      type: 'UUID',
      references: '"user"(id)',
      onUpdate: 'CASCADE',
    },
    is_active: { type: 'BOOLEAN', notNull: true, default: true },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('current_TIMESTAMP') },
    created_by: {
      type: 'UUID',
      references: '"user"(id)',
      onUpdate: 'CASCADE',
    },
    updated_at: { type: 'TIMESTAMP', default: null },
    updated_by: {
      type: 'UUID',
      references: '"user"(id)',
      onUpdate: 'CASCADE',
    },
    deleted_at: { type: 'TIMESTAMP', default: null },
    deleted_by: {
      type: 'UUID',
      references: '"user"(id)',
      onUpdate: 'CASCADE',
    },
  });

  pgm.createIndex('mahasiswa', 'nama_lengkap', { name: 'idx_mahasiswa_nama_lengkap' });

  pgm.createIndex('mahasiswa', 'program_studi_id', { name: 'idx_mahasiswa_program_studi_id' });

  pgm.createIndex('mahasiswa', 'status_verifikasi_id', { name: 'idx_mahasiswa_status_verifikasi_id' });

  pgm.createIndex('mahasiswa', 'verified_at', { name: 'idx_mahasiswa_verified_at' });

  pgm.createIndex('mahasiswa', 'verified_by', { name: 'idx_mahasiswa_verified_by' });

  pgm.createIndex('mahasiswa', 'is_active', { name: 'idx_mahasiswa_is_active' });

  pgm.createIndex('mahasiswa', 'tanggal_lahir', { name: 'idx_mahasiswa_tanggal_lahir' });

  pgm.createIndex('mahasiswa', 'jenis_kelamin', { name: 'idx_mahasiswa_jenis_kelamin' });

  pgm.createIndex('mahasiswa', ['program_studi_id', 'is_active', 'nama_lengkap'], { name: 'idx_mahasiswa_prodi_active_nama' });

  pgm.createIndex('mahasiswa', 'created_at', { name: 'idx_mahasiswa_created_at' });

  pgm.createIndex('mahasiswa', 'updated_at', { name: 'idx_mahasiswa_updated_at' });
  
  pgm.createIndex('mahasiswa', 'deleted_at', { name: 'idx_mahasiswa_deleted_at' });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropIndex('mahasiswa', 'nama_lengkap', { name: 'idx_mahasiswa_nama_lengkap' });

  pgm.dropIndex('mahasiswa', 'program_studi_id', { name: 'idx_mahasiswa_program_studi_id' });

  pgm.dropIndex('mahasiswa', 'status_verifikasi_id', { name: 'idx_mahasiswa_status_verifikasi_id' });

  pgm.dropIndex('mahasiswa', 'verified_at', { name: 'idx_mahasiswa_verified_at' });

  pgm.dropIndex('mahasiswa', 'verified_by', { name: 'idx_mahasiswa_verified_by' });

  pgm.dropIndex('mahasiswa', 'is_active', { name: 'idx_mahasiswa_is_active' });

  pgm.dropIndex('mahasiswa', 'tanggal_lahir', { name: 'idx_mahasiswa_tanggal_lahir' });

  pgm.dropIndex('mahasiswa', 'jenis_kelamin', { name: 'idx_mahasiswa_jenis_kelamin' });

  pgm.dropIndex('mahasiswa', ['program_studi_id', 'is_active', 'nama_lengkap'], { name: 'idx_mahasiswa_prodi_active_nama' });

  pgm.dropIndex('mahasiswa', 'created_at', { name: 'idx_mahasiswa_created_at' });

  pgm.dropIndex('mahasiswa', 'updated_at', { name: 'idx_mahasiswa_updated_at' });
  
  pgm.dropIndex('mahasiswa', 'deleted_at', { name: 'idx_mahasiswa_deleted_at' });

  pgm.dropTable("mahasiswa");
};