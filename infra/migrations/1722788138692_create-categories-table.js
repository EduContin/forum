exports.up = (pgm) => {
  pgm.createTable("categories", {
    id: "id",
    name: { type: "varchar(255)", notNull: true },
    description: { type: "text" },
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
  });
};

// eslint-disable-next-line no-unused-vars
exports.down = (pgm) => {};
