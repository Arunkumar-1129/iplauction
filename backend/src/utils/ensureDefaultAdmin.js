const User = require('../models/User');

const ensureDefaultAdmin = async () => {
  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@auction.com';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
  const name = process.env.DEFAULT_ADMIN_NAME || 'Auction Admin';

  if (!process.env.DEFAULT_ADMIN_EMAIL || !process.env.DEFAULT_ADMIN_PASSWORD) {
    console.warn(
      'Using fallback credentials for default admin. Set DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD in .env to override.'
    );
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return;
  }

  await User.create({
    name,
    email,
    password,
    role: 'admin',
  });
  console.log(`Default admin created with email ${email}`);
};

module.exports = ensureDefaultAdmin;

