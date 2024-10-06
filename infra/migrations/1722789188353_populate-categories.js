exports.up = async (pgm) => {
  // Insert sections
  await pgm.sql(`
    INSERT INTO sections (name, description) VALUES
    ('Main', 'General forum sections'),
    ('Cracking', 'Cracking related sections'),
    ('Hacking and Exploits', 'Hacking and exploits related sections'),
    ('Leaks', 'Various leaked content'),
    ('Money', 'Money making methods and discussions'),
    ('Coding', 'Coding related discussions and resources'),
    ('MarketPlace', 'Marketplace for buying and selling')
  `);

  // Insert categories
  await pgm.sql(`
    INSERT INTO categories (section_id, parent_id, name, description, is_subfolder) VALUES
    ((SELECT id FROM sections WHERE name = 'Main'), NULL, 'Announcements', 'Forum announcements', false),
    ((SELECT id FROM sections WHERE name = 'Main'), NULL, 'Feedback and Suggestions', 'Provide feedback and suggestions', false),
    ((SELECT id FROM sections WHERE name = 'Main'), NULL, 'Lounge', 'General discussion area', false),
    ((SELECT id FROM sections WHERE name = 'Main'), NULL, 'Achievements and Flex', 'Share your achievements', false),
    ((SELECT id FROM sections WHERE name = 'Main'), NULL, 'World News', 'Discuss world events', false),
    ((SELECT id FROM sections WHERE name = 'Main'), NULL, 'Giveaways', 'Forum giveaways', false),
    ((SELECT id FROM sections WHERE name = 'Main'), NULL, 'International Lounge', 'Discussions in various languages', false),
    ((SELECT id FROM sections WHERE name = 'Cracking'), NULL, 'Cracking Lounge', 'General cracking discussions', false),
    ((SELECT id FROM sections WHERE name = 'Cracking'), NULL, 'Cracking Tools', 'Tools for cracking', false),
    ((SELECT id FROM sections WHERE name = 'Cracking'), NULL, 'Cracking Tutorials', 'Tutorials on cracking', false),
    ((SELECT id FROM sections WHERE name = 'Cracking'), NULL, 'Cracking Configs', 'Configuration files for cracking', false),
    ((SELECT id FROM sections WHERE name = 'Cracking'), NULL, 'Combolists', 'Combination lists for cracking', false),
    ((SELECT id FROM sections WHERE name = 'Cracking'), NULL, 'Proxylists', 'Proxy lists for cracking', false),
    ((SELECT id FROM sections WHERE name = 'Hacking and Exploits'), NULL, 'Hacking Lounge', 'General hacking discussions', false),
    ((SELECT id FROM sections WHERE name = 'Hacking and Exploits'), NULL, 'Hacking Tools', 'Tools for hacking', false),
    ((SELECT id FROM sections WHERE name = 'Hacking and Exploits'), NULL, 'Hacking Tutorials', 'Tutorials on hacking', false),
    ((SELECT id FROM sections WHERE name = 'Leaks'), NULL, 'Tutorials, Guides, Courses, etc.', 'Leaked educational content', false),
    ((SELECT id FROM sections WHERE name = 'Leaks'), NULL, 'Cracked Programs', 'Leaked software', false),
    ((SELECT id FROM sections WHERE name = 'Leaks'), NULL, 'Accounts', 'Leaked account information', false),
    ((SELECT id FROM sections WHERE name = 'Leaks'), NULL, 'Source Codes', 'Leaked source codes', false),
    ((SELECT id FROM sections WHERE name = 'Leaks'), NULL, 'Porn', 'Leaked adult content', false),
    ((SELECT id FROM sections WHERE name = 'Leaks'), NULL, 'Requests', 'Request leaks', false),
    ((SELECT id FROM sections WHERE name = 'Money'), NULL, 'Monetizing Methods', 'Ways to make money', false),
    ((SELECT id FROM sections WHERE name = 'Money'), NULL, 'Social Engineering', 'Social engineering techniques', false),
    ((SELECT id FROM sections WHERE name = 'Money'), NULL, 'Crypto', 'Cryptocurrency discussions', false),
    ((SELECT id FROM sections WHERE name = 'Money'), NULL, 'IRL Business', 'Real-life business discussions', false),
    ((SELECT id FROM sections WHERE name = 'Coding'), NULL, 'Coding Lounge', 'General coding discussions', false),
    ((SELECT id FROM sections WHERE name = 'Coding'), NULL, 'Source Codes', 'Share your source codes', false),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), NULL, 'Marketplace Discussion', 'General marketplace discussions', false),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), NULL, 'Sellers Marketplace', 'For sellers to list their offerings', false),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), NULL, 'Buyers Marketplace', 'For buyers to post their requests', false)
  `);

  // Insert subcategories
  await pgm.sql(`
    INSERT INTO categories (section_id, parent_id, name, description, is_subfolder) VALUES
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'Lounge'), 'Introduction', 'Introduce yourself to the community', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'Lounge'), 'LQ Lounge', 'Low-quality posts', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'World News'), 'Cryptocurrency', 'Cryptocurrency news', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'World News'), 'Hacking', 'Hacking-related news', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'International Lounge'), 'Russian', 'Russian language discussions', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'International Lounge'), 'Spanish', 'Spanish language discussions', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'International Lounge'), 'Indian', 'Indian language discussions', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'International Lounge'), 'Italian', 'Italian language discussions', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'International Lounge'), 'French', 'French language discussions', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'International Lounge'), 'Portuguese', 'Portuguese language discussions', true),
    ((SELECT id FROM sections WHERE name = 'Money'), (SELECT id FROM categories WHERE name = 'Social Engineering'), 'E-whoring', 'E-whoring techniques and discussions', true),
    ((SELECT id FROM sections WHERE name = 'Money'), (SELECT id FROM categories WHERE name = 'Social Engineering'), 'Tutorials', 'Social engineering tutorials', true),
    ((SELECT id FROM sections WHERE name = 'Money'), (SELECT id FROM categories WHERE name = 'Social Engineering'), 'Resources', 'Social engineering resources', true),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), (SELECT id FROM categories WHERE name = 'Marketplace Discussion'), 'Deal disputes', 'Resolve marketplace disputes', true),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), (SELECT id FROM categories WHERE name = 'Sellers Marketplace'), 'Products', 'Physical and digital products for sale', true),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), (SELECT id FROM categories WHERE name = 'Sellers Marketplace'), 'Services', 'Services offered by sellers', true),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), (SELECT id FROM categories WHERE name = 'Sellers Marketplace'), 'Refunding Service', 'Refunding services offered', true),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), (SELECT id FROM categories WHERE name = 'Sellers Marketplace'), 'Accounts', 'Accounts for sale', true),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), (SELECT id FROM categories WHERE name = 'Sellers Marketplace'), 'E-books/Guides/Mentorships', 'Educational content for sale', true),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), (SELECT id FROM categories WHERE name = 'Sellers Marketplace'), 'Exchange', 'Currency and crypto exchange services', true),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), (SELECT id FROM categories WHERE name = 'Buyers Marketplace'), 'Services', 'Services requested by buyers', true),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), (SELECT id FROM categories WHERE name = 'Buyers Marketplace'), 'Accounts', 'Accounts requested by buyers', true),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), (SELECT id FROM categories WHERE name = 'Buyers Marketplace'), 'Hiring', 'Job opportunities and hiring requests', true),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), (SELECT id FROM categories WHERE name = 'Buyers Marketplace'), 'Others', 'Other buying requests', true)
  `);

  // Insert tags
  await pgm.sql(`
    INSERT INTO tags (name) VALUES
    ('Accepted'),
    ('Denied'),
    ('Web'),
    ('Network'),
    ('Botnet'),
    ('Malware'),
    ('Open'),
    ('Closed')
  `);

  // Associate tags with categories
  await pgm.sql(`
    INSERT INTO category_tags (category_id, tag_id) VALUES
    ((SELECT id FROM categories WHERE name = 'Feedback and Suggestions'), (SELECT id FROM tags WHERE name = 'Accepted')),
    ((SELECT id FROM categories WHERE name = 'Feedback and Suggestions'), (SELECT id FROM tags WHERE name = 'Denied')),
    ((SELECT id FROM categories WHERE name = 'Hacking Tutorials'), (SELECT id FROM tags WHERE name = 'Web')),
    ((SELECT id FROM categories WHERE name = 'Hacking Tutorials'), (SELECT id FROM tags WHERE name = 'Network')),
    ((SELECT id FROM categories WHERE name = 'Hacking Tutorials'), (SELECT id FROM tags WHERE name = 'Botnet')),
    ((SELECT id FROM categories WHERE name = 'Hacking Tutorials'), (SELECT id FROM tags WHERE name = 'Malware')),
    ((SELECT id FROM categories WHERE name = 'Marketplace Discussion'), (SELECT id FROM tags WHERE name = 'Open')),
    ((SELECT id FROM categories WHERE name = 'Marketplace Discussion'), (SELECT id FROM tags WHERE name = 'Closed'))
  `);
};

// eslint-disable-next-line no-unused-vars
exports.down = async (pgm) => {};
