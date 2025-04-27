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
  pgm.createTable("mahasiswa", {
    id: {
      type: "UUID",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    nrp: {
      type: "VARCHAR(15)",
      notNull: true,
      unique: true,
    },
    nama_lengkap: {
      type: "VARCHAR(250)",
      notNull: true,
    },
    program_studi_id: {
      type: "UUID",
      notNull: true,
      references: "program_studi(id)",
      onUpdate: "CASCADE",
    },
    tanggal_lahir: {
      type: "DATE",
      notNull: true,
    },
    jenis_kelamin: {
      type: "CHAR(1)",
      notNull: true,
    },
    no_telepon: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    ktm_url: {
      type: "TEXT",
      notNull: true,
    },
    user_id: {
      type: "UUID",
      notNull: true,
      references: '"user"(id)',
      onUpdate: "CASCADE",
    },
    status_id: {
      type: "UUID",
      notNull: true,
      references: "status(id)",
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
      default: null,
    },
    updated_by: {
      type: "UUID",
      references: '"user"(id)',
      onUpdate: "CASCADE",
    },
    deleted_at: {
      type: "timestamp",
      default: null,
    },
    deleted_by: {
      type: "UUID",
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
  pgm.dropTable("mahasiswa");
};
