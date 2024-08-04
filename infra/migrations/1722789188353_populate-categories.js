exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO categories (name, description) VALUES
    ('General Hacking', 'Discussions about hacking Botnet, Malware, or anything else hacking related.'),
    ('Hacking Tutorials', 'Tutorials and guides on hacking and cybersecurity topics.'),
    ('Hacking Tools & Resources', 'Sharing and discussing various hacking and security tools.'),
    ('Social Engineering', 'Techniques and defenses against social engineering attacks.'),
    ('OSINT', 'Open-source intelligence gathering techniques and tools.'),
    ('Cybersecurity News', 'Latest news and updates in the world of cybersecurity.')
  `);
};

// eslint-disable-next-line no-unused-vars
exports.down = (pgm) => {};
