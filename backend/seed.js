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

dotenv.config({ path: '../.env' });

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear collections
    await Founder.deleteMany({});
    await Lead.deleteMany({});
    await Project.deleteMany({});
    await Client.deleteMany({});
    await DailyCheckin.deleteMany({});
    await KnowledgeBaseArticle.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Cleared existing data.');

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
    console.log('Inserted initial projects, clients, and KB articles.');

    const initialTransactions = [
      { type: 'revenue', amount: 180000, category: 'Project', description: 'TechNova Brand Overhaul - Phase 1', date: '2025-06-15', status: 'paid', client: 'TechNova Solutions', invoiceNumber: 'INV-2025-042', founderId: superAdmin._id },
      { type: 'revenue', amount: 80000, category: 'Project', description: 'HealthFirst Onboarding Fee', date: '2025-06-18', status: 'paid', client: 'HealthFirst Clinics', invoiceNumber: 'INV-2025-043', founderId: superAdmin._id },
      { type: 'revenue', amount: 60000, category: 'Retainer', description: 'Finwise Monthly Retainer - June', date: '2025-06-05', status: 'paid', client: 'Finwise Capital', invoiceNumber: 'INV-2025-041', founderId: superAdmin._id },
      { type: 'revenue', amount: 45000, category: 'Retainer', description: 'EduPath Monthly Retainer - June', date: '2025-06-05', status: 'overdue', client: 'EduPath Academy', invoiceNumber: 'INV-2025-040', founderId: superAdmin._id },
      { type: 'expense', amount: 42000, category: 'Salaries', description: 'Employee Salaries - June', date: '2025-06-01', status: 'paid', founderId: superAdmin._id },
      { type: 'expense', amount: 12000, category: 'Tools & Software', description: 'SaaS subscriptions - Figma, Notion, Slack, etc.', date: '2025-06-01', status: 'paid', founderId: superAdmin._id },
      { type: 'expense', amount: 8500, category: 'Ads & Marketing', description: 'Agency self-promotion ads - Google & Meta', date: '2025-06-10', status: 'paid', founderId: superAdmin._id },
      { type: 'expense', amount: 5000, category: 'Office & Admin', description: 'Co-working space - June', date: '2025-06-01', status: 'paid', founderId: superAdmin._id },
      { type: 'revenue', amount: 120000, category: 'Project', description: 'Finwise Lead Gen System - Final Milestone', date: '2025-06-28', status: 'pending', client: 'Finwise Capital', invoiceNumber: 'INV-2025-044', founderId: superAdmin._id },
      { type: 'expense', amount: 18000, category: 'Freelancers', description: 'UI/UX Contractor - TechNova project', date: '2025-06-20', status: 'paid', founderId: superAdmin._id },
    ];
    await Transaction.insertMany(initialTransactions);
    console.log('Inserted initial transactions.');

    console.log('Seed completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
