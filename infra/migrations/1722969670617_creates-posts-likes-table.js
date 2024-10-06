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
  pgm.createTable("likes", {
    id: "id",
    user_id: { type: "integer", notNull: true, references: "users" },
    post_id: {
      type: "integer",
      notNull: true,
      references: "posts",
      onDelete: "CASCADE", // Add this line
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Add a unique constraint to ensure a user can only like a post once
  pgm.addConstraint("likes", "unique_user_post_like", {
    unique: ["user_id", "post_id"],
  });
};
/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
// eslint-disable-next-line no-unused-vars
exports.down = (pgm) => {};
