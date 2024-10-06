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
  pgm.createTable("users", {
    id: "id",
    username: { type: "varchar(255)", notNull: true, unique: true },
    email: { type: "varchar(255)", notNull: true, unique: true },
    password: { type: "varchar(255)", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    avatar_url: { type: "varchar(255)" },
    bio: { type: "text" },
    user_group: { type: "varchar(50)", notNull: true, default: "Member" },
    threads_count: { type: "integer", notNull: true, default: 0 },
    posts_count: { type: "integer", notNull: true, default: 0 },
    likes_received: { type: "integer", notNull: true, default: 0 },
    reputation: { type: "integer", notNull: true, default: 0 },
    vouches: { type: "integer", notNull: true, default: 0 },
    last_seen: { type: "timestamp" },
    signature: { type: "text" },
    caution: { type: "boolean", notNull: true, default: false },
    banned: { type: "boolean", notNull: true, default: false },
  });

  pgm.createTable("user_reputations", {
    id: "id",
    user_id: {
      type: "integer",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    voter_id: {
      type: "integer",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    reputation_change: { type: "integer", notNull: true },
    comment: { type: "text", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("user_reputations", ["user_id", "voter_id"], {
    unique: true,
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
// eslint-disable-next-line no-unused-vars
exports.down = (pgm) => {};
