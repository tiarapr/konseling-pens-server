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
    pgm.createTable('otp', {
        id: {
            type: "UUID",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        email: {
            type: 'varchar(255)',
            notNull: true
        },
        otp_code: {
            type: 'varchar(10)',
            notNull: true
        },
        expires_at: {
            type: 'TIMESTAMP',
            notNull: true
        },
        created_at: {
            type: 'TIMESTAMP',
            notNull: true,
            default: pgm.func('current_TIMESTAMP')
        },
        is_used: {
            type: 'boolean',
            notNull: true,
            default: false
        }
    });

    pgm.createIndex('otp', 'email', {
        name: 'idx_otp_email'
    });
    
    pgm.createIndex('otp', 'expires_at', {
        name: 'idx_otp_expires_at'
    });

    pgm.createIndex('otp', 'is_used', {
        name: 'idx_otp_is_used'
    });

    pgm.createIndex('otp', ['email', 'is_used', 'expires_at'], {
        name: 'idx_otp_email_is_used_expires_at'
    });

    pgm.createIndex('otp', 'created_at', {
        name: 'idx_otp_created_at'
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropIndex('otp', 'email', {
        name: 'idx_otp_email'
    });
    pgm.dropIndex('otp', ['email', 'is_used', 'expires_at'], { name: 'idx_otp_email_is_used_expires_at' });
    pgm.dropIndex('otp', 'expires_at', { name: 'idx_otp_expires_at' });
    pgm.dropIndex('otp', 'is_used', { name: 'idx_otp_is_used' });
    pgm.dropIndex('otp', 'created_at', { name: 'idx_otp_created_at' });

    pgm.dropTable('otp');
};