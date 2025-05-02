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
    pgm.addColumn("konseling", {
        konselor_profil_id: {
            type: "UUID",
            notNull: false,
        },
        lokasi: {
            type: "VARCHAR(255)",
            notNull: false,
        },
    });

    // oreign key constraint
    pgm.addConstraint("konseling", "fk_konseling_konselor_profil", {
        foreignKeys: {
            columns: "konselor_profil_id",
            references: "konselor_profil(id)",
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
    pgm.dropConstraint("konseling", "fk_konseling_konselor_profil");
    pgm.dropColumn("konseling", "konselor_profil_id");
};
