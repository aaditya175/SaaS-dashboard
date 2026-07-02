import express from 'express';
import Founder from '../models/Founder.js';
import Lead from '../models/Lead.js';
import Project from '../models/Project.js';
import Client from '../models/Client.js';
import Transaction from '../models/Transaction.js';
import DailyCheckin from '../models/DailyCheckin.js';
import KnowledgeBaseArticle from '../models/KnowledgeBaseArticle.js';

import bcrypt from 'bcryptjs';

const router = express.Router();

// --- Auth Routes ---
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const founder = await Founder.findOne({ email });
    if (!founder) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, founder.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    // Return founder details (excluding password)
    const founderObj = founder.toObject();
    founderObj.id = founderObj._id.toString();
    delete founderObj._id;
    delete founderObj.password;
    res.json(founderObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware to extract founderId from query or headers
const requireFounder = (req, res, next) => {
  const founderId = req.headers['x-founder-id'] || req.query.founderId;
  if (!founderId) {
    return res.status(400).json({ message: 'founderId is required' });
  }
  req.founderId = founderId;
  next();
};

// Helper to get founder name
const getFounderName = async (founderId) => {
  const founder = await Founder.findById(founderId);
  return founder ? founder.name : 'Unknown';
};

// Helper for date calculations
const getDayDifference = (dateStr1, dateStr2) => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const utc1 = Date.UTC(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate());
  const utc2 = Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), d2.getUTCDate());
  return Math.round(Math.abs(utc1 - utc2) / (1000 * 60 * 60 * 24));
};

// Helper to calculate check-in streak for a founder
const calculateStreak = async (founderId) => {
  try {
    const checkins = await DailyCheckin.find({ founderId });
    if (checkins.length === 0) return 0;

    // Get unique check-in dates, sorted descending
    const dates = [...new Set(checkins.map(c => c.date))].sort((a, b) => b.localeCompare(a));
    if (dates.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    
    // Calculate yesterday's date string
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // If the most recent check-in is neither today nor yesterday, streak is broken
    const mostRecentDate = dates[0];
    if (mostRecentDate !== todayStr && mostRecentDate !== yesterdayStr) {
      return 0;
    }

    let streak = 0;

    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        streak = 1;
      } else {
        const diffDays = getDayDifference(dates[i - 1], dates[i]);
        if (diffDays === 1) {
          streak++;
        } else if (diffDays > 1) {
          break;
        }
      }
    }

    return streak;
  } catch (err) {
    console.error('Error calculating streak:', err);
    return 0;
  }
};

// Middleware for Super Admin only
const requireSuperAdmin = async (req, res, next) => {
  const founderId = req.headers['x-founder-id'] || req.query.founderId;
  if (!founderId) {
    return res.status(400).json({ message: 'founderId is required' });
  }
  const founder = await Founder.findById(founderId);
  if (!founder || founder.role !== 'Super Admin') {
    return res.status(403).json({ message: 'Super Admin access required' });
  }
  req.founderId = founderId;
  next();
};

// --- Founders ---
router.get('/founders', async (req, res) => {
  try {
    const founders = await Founder.find();
    
    const updatedFounders = await Promise.all(founders.map(async (founder) => {
      // Apply schema defaults if empty
      if (!founder.weeklyGoals || founder.weeklyGoals.length === 0) {
        founder.weeklyGoals = [
          'Onboard 2 new clients',
          'Conduct weekly agency sync call',
          'Review Q3 milestone status'
        ];
      }
      
      if (!founder.todayTasks || founder.todayTasks.length === 0) {
        founder.todayTasks = [
          { text: 'Review today\'s client emails', done: false },
          { text: 'Sync with product team', done: true }
        ];
      }

      if (!founder.radarData || founder.radarData.length === 0) {
        founder.radarData = [
          { subject: 'Revenue', A: founder.revenue > 0 ? Math.min(100, Math.round(founder.revenue / 5000)) : 75 },
          { subject: 'Outreach', A: founder.outreach > 0 ? Math.min(100, Math.round(founder.outreach * 2)) : 65 },
          { subject: 'Meetings', A: founder.meetings > 0 ? Math.min(100, Math.round(founder.meetings * 4)) : 80 },
          { subject: 'Tasks', A: 85 },
          { subject: 'Team', A: 90 },
          { subject: 'Strategy', A: 85 }
        ];
      }

      if (!founder.performanceTrend || founder.performanceTrend.length === 0) {
        founder.performanceTrend = [
          { week: 'Wk 1', score: 70 },
          { week: 'Wk 2', score: 75 },
          { week: 'Wk 3', score: 72 },
          { week: 'Wk 4', score: 85 },
          { week: 'Wk 5', score: 80 },
          { week: 'Wk 6', score: 90 }
        ];
      }

      // Calculate outreach count and revenue won dynamically from Lead collection
      const wonLeads = await Lead.find({
        $or: [
          { founderId: founder._id.toString() },
          { assignee: { $regex: new RegExp(`^${founder.name}$`, 'i') } }
        ],
        stage: 'Won'
      });
      const computedRevenue = wonLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);

      const computedOutreach = await Lead.countDocuments({
        $or: [
          { founderId: founder._id.toString() },
          { assignee: { $regex: new RegExp(`^${founder.name}$`, 'i') } }
        ]
      });

      founder.revenue = computedRevenue || founder.revenue || 0;
      founder.outreach = computedOutreach || founder.outreach || 0;
      founder.streak = await calculateStreak(founder._id.toString());

      // Update productivity score based on tasks done
      const totalTasks = founder.todayTasks.length;
      const completedTasks = founder.todayTasks.filter(t => t.done).length;
      founder.score = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 60;

      await founder.save();
      return founder;
    }));

    res.json(updatedFounders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/founders', requireSuperAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const newFounder = new Founder(data);
    const saved = await newFounder.save();
    
    const founderObj = saved.toObject();
    delete founderObj.password;
    res.status(201).json(founderObj);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/founders/:id', requireFounder, async (req, res) => {
  try {
    // Auth check: must be Super Admin OR updating self
    if (req.founderId !== req.params.id) {
      const requester = await Founder.findById(req.founderId);
      if (!requester || requester.role !== 'Super Admin') {
        return res.status(403).json({ message: 'Not authorized to update this founder profile' });
      }
    }

    const data = { ...req.body };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const oldFounder = await Founder.findById(req.params.id);
    if (!oldFounder) return res.status(404).json({ message: 'Founder not found' });

    // Compare todayTasks to award XP
    if (data.todayTasks && Array.isArray(data.todayTasks)) {
      const oldTasks = oldFounder.todayTasks || [];
      let newCompletedCount = 0;
      data.todayTasks.forEach(newTask => {
        if (newTask.done) {
          const wasDone = oldTasks.find(ot => ot.text === newTask.text && ot.done);
          if (!wasDone) {
            newCompletedCount++;
          }
        }
      });

      if (newCompletedCount > 0) {
        data.xp = (oldFounder.xp || 0) + (newCompletedCount * 50);
        data.level = Math.floor(data.xp / 1000) + 1;
      }
    }

    const updated = await Founder.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/founders/:id', requireSuperAdmin, async (req, res) => {
  try {
    // Prevent self-deletion on the backend just in case
    if (req.params.id === req.founderId) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    await Founder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Founder deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Leads (CRM) — GLOBAL visibility ---
router.get('/leads', requireFounder, async (req, res) => {
  try {
    const leads = await Lead.find();
    res.json(leads);
  } catch (err) {
    console.error('Error GET /leads:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/leads', requireFounder, async (req, res) => {
  try {
    const founderName = await getFounderName(req.founderId);
    const newLead = new Lead({ ...req.body, founderId: req.founderId, updatedBy: founderName });
    const saved = await newLead.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/leads/:id', requireFounder, async (req, res) => {
  try {
    const founderName = await getFounderName(req.founderId);
    const updateData = { ...req.body, updatedBy: founderName };
    
    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Lead not found' });

    // Auto-create client & project when lead moves to "Won"
    if (req.body.stage === 'Won') {
      const existingClient = await Client.findOne({ company: updated.company });
      let clientName = updated.name;
      if (!existingClient) {
        const newClient = new Client({
          founderId: req.founderId,
          name: updated.name,
          company: updated.company,
          email: updated.email,
          phone: updated.phone,
          status: 'active',
          totalRevenue: updated.value || 0,
          contractValue: updated.value || 0,
          joinedDate: new Date().toISOString().split('T')[0],
          updatedBy: founderName
        });
        await newClient.save();
        clientName = newClient.company || newClient.name;
      } else {
        clientName = existingClient.company || existingClient.name;
      }

      // Auto-create project
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 14); // Default deadline: 14 days
      
      const newProject = new Project({
        founderId: req.founderId,
        name: `${clientName} Onboarding`,
        client: clientName,
        status: 'planning',
        priority: 'medium',
        assignees: [founderName],
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        deadline: deadline.toISOString().split('T')[0],
        description: `Auto-generated project from CRM for ${clientName}`,
        budget: updated.value || 0,
        spent: 0,
        tasks: [],
        updatedBy: founderName
      });
      await newProject.save();
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/leads/:id', requireFounder, async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Projects — GLOBAL visibility ---
router.get('/projects', requireFounder, async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/projects', requireFounder, async (req, res) => {
  try {
    const founderName = await getFounderName(req.founderId);
    const newProject = new Project({ ...req.body, founderId: req.founderId, updatedBy: founderName });
    const saved = await newProject.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/projects/:id', requireFounder, async (req, res) => {
  try {
    const founderName = await getFounderName(req.founderId);
    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: founderName },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Project not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/projects/:id', requireFounder, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Clients — GLOBAL visibility ---
router.get('/clients', requireFounder, async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/clients', requireFounder, async (req, res) => {
  try {
    const founderName = await getFounderName(req.founderId);
    const newClient = new Client({ ...req.body, founderId: req.founderId, updatedBy: founderName });
    const saved = await newClient.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/clients/:id', requireFounder, async (req, res) => {
  try {
    const founderName = await getFounderName(req.founderId);
    const updated = await Client.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: founderName },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Client not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/clients/:id', requireFounder, async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Transactions — GLOBAL visibility ---
router.get('/transactions', requireFounder, async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/transactions', requireFounder, async (req, res) => {
  try {
    const founderName = await getFounderName(req.founderId);
    const newTx = new Transaction({ ...req.body, founderId: req.founderId, updatedBy: founderName });
    const saved = await newTx.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/transactions/:id', requireFounder, async (req, res) => {
  try {
    const founderName = await getFounderName(req.founderId);
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: founderName },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Transaction not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/transactions/:id', requireFounder, async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Check-ins ---
router.get('/checkins', requireFounder, async (req, res) => {
  try {
    const checkins = await DailyCheckin.find({ founderId: req.founderId });
    res.json(checkins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/checkins', requireFounder, async (req, res) => {
  try {
    const founderName = await getFounderName(req.founderId);
    const newCheckin = new DailyCheckin({
      ...req.body,
      founderId: req.founderId,
      founder: founderName
    });
    const saved = await newCheckin.save();

    // Award XP and increment streak
    const founderObj = await Founder.findById(req.founderId);
    if (founderObj) {
      founderObj.xp = (founderObj.xp || 0) + 100;
      founderObj.level = Math.floor(founderObj.xp / 1000) + 1;
      founderObj.streak = await calculateStreak(req.founderId);
      await founderObj.save();
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Knowledge Base (Shared) ---
router.get('/kb', async (req, res) => {
  try {
    const articles = await KnowledgeBaseArticle.find();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/kb', async (req, res) => {
  try {
    const newArticle = new KnowledgeBaseArticle(req.body);
    const saved = await newArticle.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
