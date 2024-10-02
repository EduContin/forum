const bcrypt = require("bcrypt");

exports.up = async function (pgm) {
  // Function to generate a random referral code
  const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  // Function to insert user if not exists
  const insertUserIfNotExists = async (
    username,
    email,
    password,
    userGroup,
  ) => {
    // Hash the password
    const hashedPassword = await bcrypt.hash("Test123@#", 10);
    const referralCode = generateReferralCode();

    // Check if user exists
    const userExists = await pgm.db.query(
      `
      SELECT username FROM users WHERE username = $1
    `,
      [username],
    );

    if (userExists.rows.length === 0) {
      // User doesn't exist, insert new user
      await pgm.db.query(
        `
        INSERT INTO users (username, email, password, user_group, referral_code)
        VALUES ($1, $2, $3, $4, $5)
      `,
        [username, email, hashedPassword, userGroup, referralCode],
      );
    } else {
      console.log(`User ${username} already exists, skipping insertion.`);
    }
  };

  // Insert or update admin user
  await insertUserIfNotExists(
    "admin",
    "admin@example.com",
    "adminpassword",
    "Admin",
  );

  // Create test users with referral relationships
  const users = [
    { username: "user1", email: "user1@example.com", password: "password1" },
    { username: "user2", email: "user2@example.com", password: "password2" },
    { username: "user3", email: "user3@example.com", password: "password3" },
    { username: "user4", email: "user4@example.com", password: "password4" },
    { username: "user5", email: "user5@example.com", password: "password5" },
  ];

  for (const user of users) {
    await insertUserIfNotExists(
      user.username,
      user.email,
      user.password,
      "Member",
    );
  }

  // Set up referral relationships
  await pgm.db.query(`
    UPDATE users SET referred_by = (SELECT id FROM users WHERE username = 'user1')
    WHERE username IN ('user2', 'user3');

    UPDATE users SET referred_by = (SELECT id FROM users WHERE username = 'user2')
    WHERE username IN ('user4', 'user5');
  `);

  // Add some affiliate balance to users
  await pgm.db.query(`
    UPDATE users SET affiliate_balance = 20 WHERE username = 'user1';
    UPDATE users SET affiliate_balance = 10 WHERE username = 'user2';
  `);

  // Create some referral records
  await pgm.db.query(`
    INSERT INTO referrals (referrer_id, referred_id, commission)
    SELECT 
      (SELECT id FROM users WHERE username = 'user1'),
      id,
      8
    FROM users WHERE username IN ('user2', 'user3');

    INSERT INTO referrals (referrer_id, referred_id, commission)
    SELECT 
      (SELECT id FROM users WHERE username = 'user2'),
      id,
      8
    FROM users WHERE username IN ('user4', 'user5');
  `);
};

// eslint-disable-next-line no-unused-vars
exports.down = function (pgm) {};
