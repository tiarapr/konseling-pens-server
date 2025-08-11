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
    pgm.sql(`
        CREATE OR REPLACE FUNCTION fn_log_status_janji_temu()
        RETURNS TRIGGER AS $$
        BEGIN
        INSERT INTO log_status_janji_temu (
            janji_temu_id,
            old_status,
            new_status,
            changed_by,
            changed_at
        )
        VALUES (
            OLD.id,
            OLD.status,
            NEW.status,
            NEW.status_changed_by,
            CURRENT_TIMESTAMP
        );

        RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);

    pgm.sql(`
        CREATE TRIGGER trg_log_status_janji_temu
        AFTER UPDATE ON janji_temu
        FOR EACH ROW
        WHEN (OLD.status IS DISTINCT FROM NEW.status)
        EXECUTE FUNCTION fn_log_status_janji_temu();
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    // First drop the trigger that depends on the function
    pgm.sql(`
        DROP TRIGGER IF EXISTS trg_log_status_janji_temu ON janji_temu;
    `);

    // Then drop the function safely
    pgm.sql(`
        DROP FUNCTION IF EXISTS fn_log_status_janji_temu();
    `);
};
