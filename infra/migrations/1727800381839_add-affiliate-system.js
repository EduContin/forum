/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = async function (pgm) {
  // Add referral_code column to users table
  pgm.addColumn("users", {
    referral_code: { type: "varchar(20)", unique: true },
    referred_by: { type: "integer", references: "users" },
    affiliate_balance: { type: "decimal(10,2)", notNull: true, default: 0 },
  });

  // Create referrals table
  pgm.createTable("referrals", {
    id: "id",
    referrer_id: { type: "integer", notNull: true, references: "users" },
    referred_id: { type: "integer", notNull: true, references: "users" },
    commission: { type: "decimal(10,2)", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Create withdrawals table
  pgm.createTable("withdrawals", {
    id: "id",
    user_id: { type: "integer", notNull: true, references: "users" },
    amount: { type: "decimal(10,2)", notNull: true },
    status: { type: "varchar(20)", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    processed_at: { type: "timestamp" },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
// eslint-disable-next-line no-unused-vars
exports.down = (pgm) => {};
