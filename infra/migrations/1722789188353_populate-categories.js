// migrations/YYYYMMDDHHMMSS_populate_forum_structure.js

exports.up = async (pgm) => {
  // Insert sections
  const sectionsQuery = `
    INSERT INTO sections (name, description) VALUES
    ('Main', 'General forum sections'),
    ('Cracking', 'Cracking related sections'),
    ('Hacking & Exploits', 'Hacking and exploits related sections'),
    ('Leaks', 'Various leaked content'),
    ('Money', 'Money making methods and discussions'),
    ('Coding', 'Coding related discussions and resources'),
    ('MarketPlace', 'Marketplace for buying and selling')
    RETURNING id, name
  `;
  const sections = await pgm.db.query(sectionsQuery);

  // Helper function to find section id by name
  const getSectionId = (name) => sections.rows.find((s) => s.name === name).id;

  // Insert categories
  const categoriesQuery = `
    INSERT INTO categories (section_id, parent_id, name, description, is_subfolder) VALUES
    (${getSectionId("Main")}, NULL, 'Announcements', 'Forum announcements', false),
    (${getSectionId("Main")}, NULL, 'Feedback & Suggestions', 'Provide feedback and suggestions', false),
    (${getSectionId("Main")}, NULL, 'Lounge', 'General discussion area', false),
    (${getSectionId("Main")}, NULL, 'Achievements & Flex', 'Share your achievements', false),
    (${getSectionId("Main")}, NULL, 'World News', 'Discuss world events', false),
    (${getSectionId("Main")}, NULL, 'Giveaways', 'Forum giveaways', false),
    (${getSectionId("Main")}, NULL, 'International Lounge', 'Discussions in various languages', false),
    (${getSectionId("Cracking")}, NULL, 'Cracking Lounge', 'General cracking discussions', false),
    (${getSectionId("Cracking")}, NULL, 'Cracking Tools', 'Tools for cracking', false),
    (${getSectionId("Cracking")}, NULL, 'Cracking Tutorials', 'Tutorials on cracking', false),
    (${getSectionId("Cracking")}, NULL, 'Cracking Configs', 'Configuration files for cracking', false),
    (${getSectionId("Cracking")}, NULL, 'Combolists', 'Combination lists for cracking', false),
    (${getSectionId("Cracking")}, NULL, 'Proxylists', 'Proxy lists for cracking', false),
    (${getSectionId("Hacking & Exploits")}, NULL, 'Hacking Lounge', 'General hacking discussions', false),
    (${getSectionId("Hacking & Exploits")}, NULL, 'Hacking Tools', 'Tools for hacking', false),
    (${getSectionId("Hacking & Exploits")}, NULL, 'Hacking Tutorials', 'Tutorials on hacking', false),
    (${getSectionId("Leaks")}, NULL, 'Tutorials, Guides, Courses, etc.', 'Leaked educational content', false),
    (${getSectionId("Leaks")}, NULL, 'Cracked Programs', 'Leaked software', false),
    (${getSectionId("Leaks")}, NULL, 'Accounts', 'Leaked account information', false),
    (${getSectionId("Leaks")}, NULL, 'Source Codes', 'Leaked source codes', false),
    (${getSectionId("Leaks")}, NULL, 'Porn', 'Leaked adult content', false),
    (${getSectionId("Leaks")}, NULL, 'Requests', 'Request leaks', false),
    (${getSectionId("Money")}, NULL, 'Monetizing Methods', 'Ways to make money', false),
    (${getSectionId("Money")}, NULL, 'Social Engineering', 'Social engineering techniques', false),
    (${getSectionId("Money")}, NULL, 'Crypto', 'Cryptocurrency discussions', false),
    (${getSectionId("Money")}, NULL, 'IRL Business', 'Real-life business discussions', false),
    (${getSectionId("Coding")}, NULL, 'Coding Lounge', 'General coding discussions', false),
    (${getSectionId("Coding")}, NULL, 'Source Codes', 'Share your source codes', false),
    (${getSectionId("MarketPlace")}, NULL, 'Marketplace Discussion', 'General marketplace discussions', false),
    (${getSectionId("MarketPlace")}, NULL, 'Sellers Marketplace', 'For sellers to list their offerings', false),
    (${getSectionId("MarketPlace")}, NULL, 'Buyers Marketplace', 'For buyers to post their requests', false)
    RETURNING id, name
  `;
  const categories = await pgm.db.query(categoriesQuery);

  // Helper function to find category id by name
  const getCategoryId = (name) =>
    categories.rows.find((c) => c.name === name).id;

  // Insert subcategories
  const subcategoriesQuery = `
    INSERT INTO categories (section_id, parent_id, name, description, is_subfolder) VALUES
    (${getSectionId("Main")}, ${getCategoryId("Lounge")}, 'Introduction', 'Introduce yourself to the community', true),
    (${getSectionId("Main")}, ${getCategoryId("Lounge")}, 'LQ Lounge', 'Low-quality posts', true),
    (${getSectionId("Main")}, ${getCategoryId("World News")}, 'Cryptocurrency', 'Cryptocurrency news', true),
    (${getSectionId("Main")}, ${getCategoryId("World News")}, 'Hacking', 'Hacking-related news', true),
    (${getSectionId("Main")}, ${getCategoryId("International Lounge")}, 'Russian', 'Russian language discussions', true),
    (${getSectionId("Main")}, ${getCategoryId("International Lounge")}, 'Spanish', 'Spanish language discussions', true),
    (${getSectionId("Main")}, ${getCategoryId("International Lounge")}, 'Indian', 'Indian language discussions', true),
    (${getSectionId("Main")}, ${getCategoryId("International Lounge")}, 'Italiano', 'Italian language discussions', true),
    (${getSectionId("Main")}, ${getCategoryId("International Lounge")}, 'Français', 'French language discussions', true),
    (${getSectionId("Main")}, ${getCategoryId("International Lounge")}, 'Português', 'Portuguese language discussions', true),
    (${getSectionId("Money")}, ${getCategoryId("Social Engineering")}, 'E-whoring', 'E-whoring techniques and discussions', true),
    (${getSectionId("Money")}, ${getCategoryId("Social Engineering")}, 'Tutorials', 'Social engineering tutorials', true),
    (${getSectionId("Money")}, ${getCategoryId("Social Engineering")}, 'Resources', 'Social engineering resources', true),
    (${getSectionId("MarketPlace")}, ${getCategoryId("Marketplace Discussion")}, 'Deal disputes', 'Resolve marketplace disputes', true),
    (${getSectionId("MarketPlace")}, ${getCategoryId("Sellers Marketplace")}, 'Products', 'Physical and digital products for sale', true),
    (${getSectionId("MarketPlace")}, ${getCategoryId("Sellers Marketplace")}, 'Services', 'Services offered by sellers', true),
    (${getSectionId("MarketPlace")}, ${getCategoryId("Sellers Marketplace")}, 'Refunding Service', 'Refunding services offered', true),
    (${getSectionId("MarketPlace")}, ${getCategoryId("Sellers Marketplace")}, 'Accounts', 'Accounts for sale', true),
    (${getSectionId("MarketPlace")}, ${getCategoryId("Sellers Marketplace")}, 'E-books/Guides/Mentorships', 'Educational content for sale', true),
    (${getSectionId("MarketPlace")}, ${getCategoryId("Sellers Marketplace")}, 'Exchange', 'Currency and crypto exchange services', true),
    (${getSectionId("MarketPlace")}, ${getCategoryId("Buyers Marketplace")}, 'Services', 'Services requested by buyers', true),
    (${getSectionId("MarketPlace")}, ${getCategoryId("Buyers Marketplace")}, 'Accounts', 'Accounts requested by buyers', true),
    (${getSectionId("MarketPlace")}, ${getCategoryId("Buyers Marketplace")}, 'Hiring', 'Job opportunities and hiring requests', true),
    (${getSectionId("MarketPlace")}, ${getCategoryId("Buyers Marketplace")}, 'Others', 'Other buying requests', true)
  `;
  await pgm.db.query(subcategoriesQuery);

  // Insert tags
  const tagsQuery = `
    INSERT INTO tags (name) VALUES
    ('Accepted'),
    ('Denied'),
    ('Web'),
    ('Network'),
    ('Botnet'),
    ('Malware'),
    ('Open'),
    ('Closed')
    RETURNING id, name
  `;
  const tags = await pgm.db.query(tagsQuery);

  // Helper function to find tag id by name
  const getTagId = (name) => tags.rows.find((t) => t.name === name).id;

  // Associate tags with categories
  const categoryTagsQuery = `
    INSERT INTO category_tags (category_id, tag_id) VALUES
    (${getCategoryId("Feedback & Suggestions")}, ${getTagId("Accepted")}),
    (${getCategoryId("Feedback & Suggestions")}, ${getTagId("Denied")}),
    (${getCategoryId("Hacking Tutorials")}, ${getTagId("Web")}),
    (${getCategoryId("Hacking Tutorials")}, ${getTagId("Network")}),
    (${getCategoryId("Hacking Tutorials")}, ${getTagId("Botnet")}),
    (${getCategoryId("Hacking Tutorials")}, ${getTagId("Malware")}),
    (${getCategoryId("Marketplace Discussion")}, ${getTagId("Open")}),
    (${getCategoryId("Marketplace Discussion")}, ${getTagId("Closed")})
  `;
  await pgm.db.query(categoryTagsQuery);
};

// eslint-disable-next-line no-unused-vars
exports.down = async (pgm) => {};
