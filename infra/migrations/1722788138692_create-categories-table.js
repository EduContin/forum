// migrations/YYYYMMDDHHMMSS_create_forum_structure.js

exports.up = async (pgm) => {
  // Create sections table
  pgm.createTable("sections", {
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

  // Create categories table
  pgm.createTable("categories", {
    id: "id",
    section_id: {
      type: "integer",
      references: "sections(id)",
      onDelete: "CASCADE",
    },
    parent_id: {
      type: "integer",
      references: "categories(id)",
      onDelete: "CASCADE",
    },
    name: { type: "varchar(255)", notNull: true },
    description: { type: "text" },
    is_subfolder: {
      type: "boolean",
      default: false,
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
  });

  // Create tags table
  pgm.createTable("tags", {
    id: "id",
    name: { type: "varchar(255)", notNull: true },
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

  // Create category_tags table
  pgm.createTable("category_tags", {
    category_id: {
      type: "integer",
      references: "categories(id)",
      onDelete: "CASCADE",
    },
    tag_id: {
      type: "integer",
      references: "tags(id)",
      onDelete: "CASCADE",
    },
  });

  pgm.addConstraint("category_tags", "category_tags_pkey", {
    primaryKey: ["category_id", "tag_id"],
  });
};

exports.down = (pgm) => {
  pgm.dropTable("category_tags");
  pgm.dropTable("tags");
  pgm.dropTable("categories");
  pgm.dropTable("sections");
};
