exports.up = (pgm) => {
  pgm.createTable("threads", {
    id: "id",
    title: { type: "varchar(255)", notNull: true },
    user_id: {
      type: "integer",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    category_id: {
      type: "integer",
      notNull: true,
      references: '"categories"',
      onDelete: "CASCADE",
    },
    view_count: { type: "integer", default: 0 },
    status: { type: "varchar(20)", default: "open" },
  });

  pgm.createTable("posts", {
    id: "id",
    content: { type: "text", notNull: true },
    user_id: {
      type: "integer",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    thread_id: {
      type: "integer",
      notNull: true,
      references: '"threads"',
      onDelete: "CASCADE",
    },
    parent_post_id: {
      type: "integer",
      references: '"posts"',
      onDelete: "SET NULL",
    },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    likes_count: { type: "integer", notNull: true, default: 0 },
    is_deleted: { type: "boolean", default: false },
  });
};

// eslint-disable-next-line no-unused-vars
exports.down = (pgm) => {};
