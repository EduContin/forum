exports.up = async (pgm) => {
  // Insert sections
  await pgm.sql(`
    INSERT INTO sections (name, description) VALUES
    ('Main', 'General forum sections'),
    ('Software Development', 'Programming and software development'),
    ('Networking', 'Computer networking and infrastructure'),
    ('Cloud & DevOps', 'Cloud computing and DevOps'),
    ('MarketPlace', 'Marketplace for buying and selling')
  `);

  // Insert categories
  await pgm.sql(`
    INSERT INTO categories (section_id, parent_id, name, description, is_subfolder) VALUES
    ((SELECT id FROM sections WHERE name = 'Main'), NULL, 'Announcements', 'Forum announcements', false),
    ((SELECT id FROM sections WHERE name = 'Main'), NULL, 'Feedback and Suggestions', 'Provide feedback and suggestions', false),
    ((SELECT id FROM sections WHERE name = 'Main'), NULL, 'Lounge', 'General discussion area', false),
    ((SELECT id FROM sections WHERE name = 'Main'), NULL, 'Achievements and Flex', 'Share your achievements', false),
    ((SELECT id FROM sections WHERE name = 'Main'), NULL, 'Tech News', 'Discuss technology news and trends', false),
    ((SELECT id FROM sections WHERE name = 'Main'), NULL, 'Giveaways', 'Forum giveaways', false),
    ((SELECT id FROM sections WHERE name = 'Main'), NULL, 'International Lounge', 'Discussions in various languages', false),
    ((SELECT id FROM sections WHERE name = 'Software Development'), NULL, 'Programming Lounge', 'General programming discussions', false),
    ((SELECT id FROM sections WHERE name = 'Software Development'), NULL, 'Languages & Frameworks', 'Discuss programming languages and frameworks', false),
    ((SELECT id FROM sections WHERE name = 'Software Development'), NULL, 'Tutorials', 'Programming tutorials and guides', false),
    ((SELECT id FROM sections WHERE name = 'Software Development'), NULL, 'Source Codes', 'Share your source codes', false),
    ((SELECT id FROM sections WHERE name = 'Networking'), NULL, 'Networking Lounge', 'General networking discussions', false),
    ((SELECT id FROM sections WHERE name = 'Networking'), NULL, 'Network Tools', 'Networking tools and utilities', false),
    ((SELECT id FROM sections WHERE name = 'Networking'), NULL, 'Network Tutorials', 'Networking tutorials and guides', false),
    ((SELECT id FROM sections WHERE name = 'Cloud & DevOps'), NULL, 'Cloud Lounge', 'Cloud computing discussions', false),
    ((SELECT id FROM sections WHERE name = 'Cloud & DevOps'), NULL, 'DevOps', 'DevOps practices and tools', false),
    ((SELECT id FROM sections WHERE name = 'Cloud & DevOps'), NULL, 'Cloud Tutorials', 'Cloud and DevOps tutorials', false),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), NULL, 'Marketplace Discussion', 'General marketplace discussions', false),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), NULL, 'Sellers Marketplace', 'For sellers to list their offerings', false),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), NULL, 'Buyers Marketplace', 'For buyers to post their requests', false)
  `);

  // Insert subcategories
  await pgm.sql(`
    INSERT INTO categories (section_id, parent_id, name, description, is_subfolder) VALUES
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'Lounge'), 'Introduction', 'Introduce yourself to the community', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'Lounge'), 'Off-topic', 'Non-technical discussions', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'Tech News'), 'Startups', 'Startup and entrepreneurship news', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'Tech News'), 'Gadgets', 'Gadget and hardware news', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'International Lounge'), 'Russian', 'Russian language discussions', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'International Lounge'), 'Spanish', 'Spanish language discussions', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'International Lounge'), 'Indian', 'Indian language discussions', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'International Lounge'), 'Italian', 'Italian language discussions', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'International Lounge'), 'French', 'French language discussions', true),
    ((SELECT id FROM sections WHERE name = 'Main'), (SELECT id FROM categories WHERE name = 'International Lounge'), 'Portuguese', 'Portuguese language discussions', true),
    ((SELECT id FROM sections WHERE name = 'Software Development'), (SELECT id FROM categories WHERE name = 'Languages & Frameworks'), 'Python', 'Python programming discussions', true),
    ((SELECT id FROM sections WHERE name = 'Software Development'), (SELECT id FROM categories WHERE name = 'Languages & Frameworks'), 'JavaScript', 'JavaScript programming discussions', true),
    ((SELECT id FROM sections WHERE name = 'Software Development'), (SELECT id FROM categories WHERE name = 'Languages & Frameworks'), 'Java', 'Java programming discussions', true),
    ((SELECT id FROM sections WHERE name = 'Software Development'), (SELECT id FROM categories WHERE name = 'Languages & Frameworks'), 'C#', 'C# programming discussions', true),
    ((SELECT id FROM sections WHERE name = 'Software Development'), (SELECT id FROM categories WHERE name = 'Languages & Frameworks'), 'Other Languages', 'Other programming languages', true),
    ((SELECT id FROM sections WHERE name = 'Cloud & DevOps'), (SELECT id FROM categories WHERE name = 'DevOps'), 'CI/CD', 'Continuous Integration/Continuous Deployment', true),
    ((SELECT id FROM sections WHERE name = 'Cloud & DevOps'), (SELECT id FROM categories WHERE name = 'DevOps'), 'Containers', 'Containers and orchestration', true),
    ((SELECT id FROM sections WHERE name = 'Cloud & DevOps'), (SELECT id FROM categories WHERE name = 'Cloud Lounge'), 'AWS', 'Amazon Web Services', true),
    ((SELECT id FROM sections WHERE name = 'Cloud & DevOps'), (SELECT id FROM categories WHERE name = 'Cloud Lounge'), 'Azure', 'Microsoft Azure', true),
    ((SELECT id FROM sections WHERE name = 'Cloud & DevOps'), (SELECT id FROM categories WHERE name = 'Cloud Lounge'), 'Google Cloud', 'Google Cloud Platform', true),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), (SELECT id FROM categories WHERE name = 'Marketplace Discussion'), 'Deal disputes', 'Resolve marketplace disputes', true),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), (SELECT id FROM categories WHERE name = 'Sellers Marketplace'), 'Products', 'Physical and digital products for sale', true),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), (SELECT id FROM categories WHERE name = 'Sellers Marketplace'), 'Services', 'Services offered by sellers', true),
    ((SELECT id FROM sections WHERE name = 'MarketPlace'), (SELECT id FROM categories WHERE name = 'Sellers Marketplace'), 'Consulting', 'Consulting services offered', true),
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
    ('Cloud'),
    ('Open'),
    ('Closed')
  `);

  // Associate tags with categories
  await pgm.sql(`
    INSERT INTO category_tags (category_id, tag_id) VALUES
    ((SELECT id FROM categories WHERE name = 'Feedback and Suggestions'), (SELECT id FROM tags WHERE name = 'Accepted')),
    ((SELECT id FROM categories WHERE name = 'Feedback and Suggestions'), (SELECT id FROM tags WHERE name = 'Denied')),
    ((SELECT id FROM categories WHERE name = 'Cloud Tutorials'), (SELECT id FROM tags WHERE name = 'Cloud')),
    ((SELECT id FROM categories WHERE name = 'Marketplace Discussion'), (SELECT id FROM tags WHERE name = 'Open')),
    ((SELECT id FROM categories WHERE name = 'Marketplace Discussion'), (SELECT id FROM tags WHERE name = 'Closed'))
  `);
};

// eslint-disable-next-line no-unused-vars
exports.down = async (pgm) => {};
