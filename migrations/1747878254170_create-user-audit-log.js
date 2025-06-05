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
    // 1. Create audit log table
    pgm.createTable('user_audit_log', {
         id: {
            type: "UUID",
            primaryKey: true,
            default: pgm.func("gen_random_uuid()"),
        },
        user_id: { type: 'uuid', notNull: true },
        action: { type: 'varchar(10)', notNull: true },
        old_data: { type: 'jsonb' },
        new_data: { type: 'jsonb' },
        changed_by: { type: 'uuid' },
        changed_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // 2. Add constraint: action must be one of CREATE, UPDATE, DELETE
    pgm.addConstraint('user_audit_log', 'user_audit_log_action_check', {
        check: "action IN ('CREATE', 'UPDATE', 'DELETE')",
    });

    // 3. Create trigger function
    pgm.sql(`
    CREATE OR REPLACE FUNCTION log_user_changes()
    RETURNS TRIGGER AS $$
    DECLARE
      v_action VARCHAR(10);
      v_user_id UUID;
    BEGIN
      IF (TG_OP = 'DELETE') THEN
        v_action := 'DELETE';
        v_user_id := OLD.id;
      ELSIF (TG_OP = 'UPDATE') THEN
        v_action := 'UPDATE';
        v_user_id := NEW.id;
      ELSIF (TG_OP = 'INSERT') THEN
        v_action := 'CREATE';
        v_user_id := NEW.id;
      END IF;

      INSERT INTO user_audit_log (
        user_id, action, old_data, new_data, changed_by, changed_at
      ) VALUES (
        v_user_id,
        v_action,
        CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        CASE 
          WHEN TG_OP = 'DELETE' THEN OLD.deleted_by
          WHEN TG_OP = 'UPDATE' THEN NEW.updated_by
          WHEN TG_OP = 'INSERT' THEN NEW.created_by
        END,
        current_timestamp
      );

      RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
    END;
    $$ LANGUAGE plpgsql;
  `);

    // 4. Attach trigger to `user` table
    pgm.createTrigger('user', 'user_audit_trigger', {
        when: 'AFTER',
        operation: ['INSERT', 'UPDATE', 'DELETE'],
        level: 'ROW',
        function: 'log_user_changes',
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    // Drop trigger and function first (order matters)
    pgm.dropTrigger('user', 'user_audit_trigger');
    pgm.sql(`DROP FUNCTION IF EXISTS log_user_changes();`);

    // Drop table
    pgm.dropTable('user_audit_log');
};
