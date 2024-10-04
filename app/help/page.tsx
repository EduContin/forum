// pages/help.tsx

"use client";

import React, { useState } from "react";
import Head from "next/head";

const RuleSection: React.FC<{ title: string; rules: string[] }> = ({
  title,
  rules,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 transition-colors duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-xl font-semibold text-blue-300 flex justify-between items-center">
          {title}
          <svg
            className={`w-6 h-6 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </h3>
      </button>
      {isOpen && (
        <div className="mt-2 p-4 bg-gray-800 rounded-lg">
          <ol className="list-decimal list-inside text-gray-300 space-y-2">
            {rules.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

const HelpPage: React.FC = () => {
  const generalRules = [
    "Site rules are non-negotiable and apply site-wide, including the shoutbox. Violation will result in account termination.",
    "Malicious activities towards the board are strictly prohibited. This includes, but is not limited to, hacking attempts, DDoS attacks, or any actions intended to disrupt the forum's functionality.",
    "Fraudulent activities (e.g., carding, government/military data leaks, ransomware) are strictly prohibited.",
    "Doxing, attempting to harm other members, or infecting/stealing from them is forbidden and will lead to account termination.",
    "Harassment or stalking of other members will not be tolerated. This includes threats, unwanted contact, and any behavior that could be viewed as menacing or abusive, both online and offline.",
    "Impersonation of other members or staff is prohibited. Members must not create accounts or use usernames that can be misleading and may impersonate others.",
    "Multi-accounting and account sharing are prohibited. Creating multiple accounts voids ban appeal rights.",
    "Abusing stat systems (likes, reputation, vouches) is prohibited and will result in permanent bans and stat wiping.",
    "Posting child pornography is strictly forbidden and will result in a permanent ban.",
    "Using temporary accounts to appeal bans in the shoutbox will lead to permanent bans.",
    "We reserve the right to disable auth keys for abusive behavior without notice.",
    "Collusion to defraud or take advantage of other members in transactions, including conspiracy to mislead or deceive, is strictly prohibited.",
    "Members are responsible for safeguarding confidential information, whether shared in private messages or public threads, and should not disclose personal information of others without consent.",
  ];

  const postingRules = [
    "Violations can result in warnings or account termination.",
    "Spam posting, including short replies or emoji-only posts, is prohibited.",
    "This is an English board. Use the International Lounge for other languages.",
    "Posting offensive material with intent to harm is prohibited.",
    "Topics can be bumped once every 24 hours. Asking others to bump for you is not allowed.",
    "Revenue-generating links ('cashlinks') are prohibited.",
    "When posting tools, include a VirusTotal scan of all files, not just the archive.",
    "Vouch copies are for upgraded members only, but thread starters can grant them to anyone.",
    "Cross-posting in multiple sections is not allowed.",
    "Thread titles must be relevant to the content.",
    "You are fully responsible for all content you post.",
    "Take arguments to private messages.",
    "Leaking projects currently sold on Alpened is prohibited unless the leak predates the sale.",
    "Sharing unchecked codes is prohibited.",
    "Post content in the correct category to avoid punishment.",
    "BB-Codes are not allowed in titles.",
    "When posting referral/affiliate links, include non-referral alternatives.",
    "Begging for donations is not allowed.",
    "Giveaways must have reasonable timeframes for winner selection (24h - 7 days) and prize claiming (e.g., 24 hours).",
  ];

  const marketplaceRules = [
    "Vouch copy requests are for upgraded members only, but sellers can grant them to anyone.",
    "Excessive vouch copy requesting may result in suspension.",
    "'Proxy selling' (selling for others) and cross-posting are prohibited.",
    "All sales threads must be in the marketplace section.",
    "Fraud-related sales threads are prohibited.",
    "Marketplace threads can be bumped once every 24 hours.",
    "Only Alpened team members can provide middleman services.",
    "Sales trashing is prohibited. Warn of scammers only with proof.",
    "Vouches from other forums are not valid here.",
    "Vouch copy recipients must leave product reviews.",
    "TOS may be ignored in scam reports at Alpened team's discretion.",
    "Selling free public services/products is not allowed.",
    "Only upgraded members can advertise in the marketplace.",
    "Publishing cracked versions of marketplace tools is prohibited.",
    "Posting in deal disputes you're not involved in will result in warnings.",
  ];

  const shoutboxRules = [
    "All forum rules apply to the shoutbox.",
    "Buying/selling/trading and account requests are forbidden in the shoutbox.",
    "Do not post accounts or items in the shoutbox.",
    "Take extended arguments to private messages.",
    "Do not PM staff about ban removals; bans will not be reversed.",
    "Asking for likes/reputation/vouches in the shoutbox is prohibited.",
    "Do not spam or use scripts for spamming in the shoutbox.",
    "Posting download links in the shoutbox is not allowed.",
    "BBCodes are not allowed in the shoutbox.",
    "The shoutbox is for casual chat, not for asking help.",
    "Avoid excessive use of capital letters.",
    "English is the only allowed language in the shoutbox.",
    "Asking or paying others to post on your behalf in the Shoutbox marketplace will result in shop blacklisting.",
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
      <Head>
        <title>Alpened - Help & Information</title>
        <meta
          name="description"
          content="Help and information for Alpened forum"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-400">
          Welcome to Alpened
        </h1>

        <nav className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">
            Table of Contents
          </h2>
          <ul className="space-y-2">
            <li>
              <a href="#about-us" className="text-blue-300 hover:underline">
                About Us
              </a>
            </li>
            <li>
              <a
                href="#general-rules"
                className="text-blue-300 hover:underline"
              >
                General Rules
              </a>
            </li>
            <li>
              <a
                href="#posting-rules"
                className="text-blue-300 hover:underline"
              >
                Posting Rules
              </a>
            </li>
            <li>
              <a
                href="#marketplace-rules"
                className="text-blue-300 hover:underline"
              >
                Marketplace Rules
              </a>
            </li>
            <li>
              <a
                href="#shoutbox-rules"
                className="text-blue-300 hover:underline"
              >
                Shoutbox Rules
              </a>
            </li>
          </ul>
        </nav>

        <section id="about-us" className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">
            About Us
          </h2>
          <p className="text-gray-300 mb-4">
            Alpened is a dedicated forum for individuals interested in blackhat
            hacking, offering a unique space for hackers of all skill levels,
            including whitehat, greyhat, and blackhat. Our mission is to foster
            a vibrant community where members can learn, share knowledge, and
            enjoy the camaraderie of like-minded individuals.
          </p>
          <p className="text-gray-300 mb-4">
            We cover a wide range of topics, including but not limited to:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4">
            <li>Cracking tutorials and tools</li>
            <li>Hacking methodologies</li>
            <li>Coding and programming insights</li>
            <li>Exposure of leaks and monetization strategies</li>
            <li>Social engineering tactics</li>
            <li>Cryptocurrency discussions</li>
            <li>Real-life business practices</li>
          </ul>
          <p className="text-gray-300 mb-4">
            As we grow, Alpened aims to implement additional features like an
            integrated shop for buying and selling, an automatic MiddleMan
            system to ensure secure transactions, and a casual casino for
            members to enjoy.
          </p>
          <p className="text-gray-300">
            Committed to a safe and enjoyable environment, we take moderation
            seriously, maintaining a respectful and secure community where
            everyone can contribute positively. We encourage all members to
            follow our rules and foster an inclusive atmosphere for all
            participants.
          </p>
        </section>

        <section className="mb-8">
          <h2
            id="general-rules"
            className="text-2xl font-semibold mb-4 text-blue-400"
          >
            Forum Rules
          </h2>
          <RuleSection title="General Rules" rules={generalRules} />
          <RuleSection title="Posting Rules" rules={postingRules} />
          <RuleSection title="Marketplace Rules" rules={marketplaceRules} />
          <RuleSection title="Shoutbox Rules" rules={shoutboxRules} />
        </section>

        <section className="mb-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">
            Terms of Service
          </h2>
          <ol className="list-decimal list-inside text-gray-300">
            <li>
              Alpened reserves the right to change the Terms of Service at any
              time without warning.
            </li>
            <li>
              All content posted within the forum falls under Alpened&apos;s
              domain, and we retain rights over it.
            </li>
            <li>
              Alpened reserves the right to ban users without further warning at
              any time.
            </li>
            <li>Illegal content is strictly prohibited.</li>
            <li>
              Failure to follow the rules will result in a ban and permanent
              loss of access to all forum features.
            </li>
            <li>
              Users are responsible for maintaining the security of their
              accounts.
            </li>
            <li>
              Alpened is not responsible for any losses incurred through
              transactions or activities on the forum.
            </li>
            <li>
              By using Alpened, you agree to comply with all applicable laws and
              regulations.
            </li>
          </ol>
        </section>

        <section className="mb-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-blue-400">
            Contact Us
          </h2>
          <p className="text-gray-300">
            For any inquiries, please contact us at:{" "}
            <a
              href="mailto:alpened@proton.me"
              className="text-blue-400 hover:underline"
            >
              alpened@proton.me
            </a>
          </p>
          <p className="mt-4 p-4 bg-blue-900 text-gray-300 rounded-lg italic">
            Important: For security reasons, please avoid including sensitive
            information in the email subject line. Be discreet, as proton.me
            does not encrypt email titles.
          </p>
        </section>
      </main>
    </div>
  );
};

export default HelpPage;
