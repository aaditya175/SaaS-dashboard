import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Founder from './models/Founder.js';

dotenv.config({ path: '../.env' });

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Wipe existing founders
    await Founder.deleteMany({});
    console.log('Cleared existing founders');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const superAdmin = new Founder({
      name: 'NexGo Tech',
      role: 'Super Admin',
      initials: 'NT',
      color: '#7c3aed',
      email: 'admin@nexgo.com',
      password: hashedPassword,
      xp: 4250,
      level: 8,
      streak: 12,
      badges: ['🏆', '🚀', '💎', '🔥'],
      revenue: 285000,
      outreach: 142,
      meetings: 18,
      score: 92
    });

    await superAdmin.save();
    console.log('Super Admin created successfully:', superAdmin.email);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    process.exit(0);
  }
}

seed();
