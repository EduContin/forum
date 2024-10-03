/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = async (pgm) => {
  pgm.createTable("pending_users", {
    order_id: { type: "varchar(255)", notNull: true, primaryKey: true },
    username: { type: "varchar(255)", notNull: true },
    email: { type: "varchar(255)", notNull: true },
    password: { type: "varchar(255)", notNull: true },
    referral: { type: "varchar(255)" },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
// eslint-disable-next-line no-unused-vars
exports.down = async (pgm) => {};
