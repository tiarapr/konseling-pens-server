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
    pgm.createTable("program_studi", {
        id: {
            type: "UUID",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        departement_id: {
            type: "UUID",
            notNull: true,
            references: "departement(id)",
            onUpdate: "CASCADE",
        },
        jenjang: {
            type: "VARCHAR(10)",
            notNull: true
        },
        nama_program_studi: {
            type: "VARCHAR(250)",
            notNull: true
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
            notNull: false,
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

    pgm.createIndex("program_studi", "nama_program_studi", {
        name: "idx_nama_program_studi_in_program_studi"
    });

    pgm.sql(`
        INSERT INTO program_studi (departement_id, jenjang, nama_program_studi)
        VALUES
        -- Departemen Teknik Elektro
        ((SELECT id FROM departement WHERE name = 'Departemen Teknik Elektro'), 'D3', 'Teknik Elektronika'),
        ((SELECT id FROM departement WHERE name = 'Departemen Teknik Elektro'), 'D4', 'Teknik Elektronika'),
        ((SELECT id FROM departement WHERE name = 'Departemen Teknik Elektro'), 'D3', 'Teknik Telekomunikasi'),
        ((SELECT id FROM departement WHERE name = 'Departemen Teknik Elektro'), 'D4', 'Teknik Telekomunikasi'),
        ((SELECT id FROM departement WHERE name = 'Departemen Teknik Elektro'), 'D3', 'Teknik Elektro Industri'),
        ((SELECT id FROM departement WHERE name = 'Departemen Teknik Elektro'), 'D4', 'Teknik Elektro Industri'),
        ((SELECT id FROM departement WHERE name = 'Departemen Teknik Elektro'), 'D4', 'Teknologi Rekayasa Internet'),

        -- Departemen Teknik Informatika dan Komputer
        ((SELECT id FROM departement WHERE name = 'Departemen Teknik Informatika dan Komputer'), 'D3', 'Teknik Informatika'),
        ((SELECT id FROM departement WHERE name = 'Departemen Teknik Informatika dan Komputer'), 'D4', 'Teknik Informatika'),
        ((SELECT id FROM departement WHERE name = 'Departemen Teknik Informatika dan Komputer'), 'D4', 'Teknik Komputer'),
        ((SELECT id FROM departement WHERE name = 'Departemen Teknik Informatika dan Komputer'), 'D4', 'Sains Data Terapan'),
        ((SELECT id FROM departement WHERE name = 'Departemen Teknik Informatika dan Komputer'), 'D3', 'Teknik Informatika (Kampus Lamongan)'),
        ((SELECT id FROM departement WHERE name = 'Departemen Teknik Informatika dan Komputer'), 'D3', 'Teknik Informatika (Kampus Sumenep)'),

        -- Departemen Teknik Mekanika dan Energi
        ((SELECT id FROM departement WHERE name = 'Departemen Teknik Mekanika dan Energi'), 'D4', 'Teknik Mekatronika'),
        ((SELECT id FROM departement WHERE name = 'Departemen Teknik Mekanika dan Energi'), 'D4', 'Sistem Pembangkit Energi'),

        -- Departemen Teknologi Multimedia Kreatif
        ((SELECT id FROM departement WHERE name = 'Departemen Teknologi Multimedia Kreatif'), 'D3', 'Teknologi Multimedia Broadcasting'),
        ((SELECT id FROM departement WHERE name = 'Departemen Teknologi Multimedia Kreatif'), 'D4', 'Teknologi Game'),
        ((SELECT id FROM departement WHERE name = 'Departemen Teknologi Multimedia Kreatif'), 'D4', 'Teknologi Rekayasa Multimedia'),
        ((SELECT id FROM departement WHERE name = 'Departemen Teknologi Multimedia Kreatif'), 'D3', 'Teknologi Multimedia Broadcasting (Kampus Lamongan)'),
        ((SELECT id FROM departement WHERE name = 'Departemen Teknologi Multimedia Kreatif'), 'D3', 'Teknologi Multimedia Broadcasting (Kampus Sumenep)'),

        -- Pendidikan Jarak Jauh
        ((SELECT id FROM departement WHERE name = 'Departemen Program Pendidikan Jarak Jauh'), 'D4', 'PJJ Teknik Telekomunikasi'),
        ((SELECT id FROM departement WHERE name = 'Departemen Program Pendidikan Jarak Jauh'), 'D3', 'PJJ Teknik Informatika');
    `);

};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('program_studi');
};
