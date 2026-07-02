import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Founder from './models/Founder.js';
import Lead from './models/Lead.js';
import Project from './models/Project.js';
import Client from './models/Client.js';
import DailyCheckin from './models/DailyCheckin.js';
import KnowledgeBaseArticle from './models/KnowledgeBaseArticle.js';
import Transaction from './models/Transaction.js';
import Meeting from './models/Meeting.js';
import ActivityLog from './models/ActivityLog.js';
import NotificationModel from './models/Notification.js';

dotenv.config({ path: '../.env' });

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all collections
    await Founder.deleteMany({});
    await Lead.deleteMany({});
    await Project.deleteMany({});
    await Client.deleteMany({});
    await DailyCheckin.deleteMany({});
    await KnowledgeBaseArticle.deleteMany({});
    await Transaction.deleteMany({});
    await Meeting.deleteMany({});
    await ActivityLog.deleteMany({});
    await NotificationModel.deleteMany({});
    console.log('Cleared existing data.');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const superAdmin = new Founder({
      name: 'NexGo Tech',
      role: 'Super Admin',
      initials: 'NT',
      color: '#7c3aed',
      email: 'admin@nexgo.com',
      password: hashedPassword,
      xp: 0,
      level: 1,
      streak: 0,
      badges: ['🏆'],
      revenue: 0,
      outreach: 0,
      meetings: 0,
      score: 0
    });

    await superAdmin.save();
    console.log('Super Admin created successfully:', superAdmin.email);

    console.log('Seed completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
