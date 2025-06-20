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
  pgm.createTable('log_user_audit', {
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
  pgm.sql(`
        ALTER TABLE log_user_audit
        ADD CONSTRAINT log_user_audit_action_check
        CHECK (action IN ('CREATE', 'UPDATE', 'DELETE'));
    `);

  // 3. Create trigger function
  pgm.sql(`
        CREATE OR REPLACE FUNCTION fn_log_user_changes()
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

            INSERT INTO log_user_audit (
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
  pgm.sql(`
        CREATE TRIGGER trg_user_audit
        AFTER INSERT OR UPDATE OR DELETE ON "user"
        FOR EACH ROW
        EXECUTE FUNCTION fn_log_user_changes();
    `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // Drop trigger and function first (order matters)
  pgm.sql(`DROP TRIGGER IF EXISTS trg_user_audit ON "user"`);
  pgm.sql(`DROP FUNCTION IF EXISTS fn_log_user_changes()`);

  // Drop table
  pgm.dropTable('log_user_audit');
};