import User from '../models/User.js';

function requireSeedEnv(name) {
  const v = process.env[name];
  if (v == null || String(v).trim() === '') {
    throw new Error(`Missing required environment variable for seeding: ${name}`);
  }
  return String(v).trim();
}

export const seedSuperAdmin = async () => {
  const exists = await User.findOne({ role: 'superadmin' });
  if (exists) return;

  const email = requireSeedEnv('SUPER_ADMIN_EMAIL').toLowerCase();
  const password = requireSeedEnv('SUPER_ADMIN_PASSWORD');

  await User.create({
    name: 'Super Admin',
    email,
    password,
    role: 'superadmin',
    isActive: true,
  });
  console.log(`Seeded superadmin: ${email}`);
};
