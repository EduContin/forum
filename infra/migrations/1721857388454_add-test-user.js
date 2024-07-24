const bcrypt = require("bcrypt");

exports.up = async (pgm) => {
  const hashedPassword = await bcrypt.hash("testpassword", 10);
  pgm.sql(`
    INSERT INTO users (email, username, password)
    VALUES ('testuser@example.com', 'testuser', '${hashedPassword}')
  `);
};

exports.down = (pgm) => {};
