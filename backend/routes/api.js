import express from 'express';
import Founder from '../models/Founder.js';
import Lead from '../models/Lead.js';
import Project from '../models/Project.js';
import Client from '../models/Client.js';
import Transaction from '../models/Transaction.js';
import DailyCheckin from '../models/DailyCheckin.js';
import KnowledgeBaseArticle from '../models/KnowledgeBaseArticle.js';
import Meeting from '../models/Meeting.js';
import ActivityLog from '../models/ActivityLog.js';
import NotificationModel from '../models/Notification.js';

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

// Helper to log activity
const logActivity = async ({ founderId, founderName, action, entityType, entityId, entityName, details, metadata, icon }) => {
  try {
    await new ActivityLog({ founderId, founderName, action, entityType, entityId, entityName, details, metadata, icon }).save();
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

// Helper to create notification
const createNotification = async ({ type, title, message, priority, icon, targetFounderId, sourceFounderId, sourceFounderName, entityType, entityId, scheduledFor }) => {
  try {
    await new NotificationModel({
      type, title, message, priority: priority || 'medium', icon: icon || '🔔',
      targetFounderId, sourceFounderId, sourceFounderName,
      entityType, entityId,
      scheduledFor, fired: !scheduledFor
    }).save();
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

import { generateSmartTasks, getAiInsights, generateDraftCheckin } from '../lib/ai.js';

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
    const oldLead = await Lead.findById(req.params.id);
    if (!oldLead) return res.status(404).json({ message: 'Lead not found' });
    
    const oldStage = oldLead.stage;
    const newStage = req.body.stage;
    const updateData = { ...req.body, updatedBy: founderName };
    
    // Auto-update lastContact when stage changes
    if (newStage && newStage !== oldStage) {
      updateData.lastContact = new Date().toISOString().split('T')[0];
    }
    
    const updated = await Lead.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    // === STAGE TRANSITION AUTOMATIONS ===
    if (newStage && newStage !== oldStage) {
      
      // --- Stage → Meeting: Auto-create editable meeting ---
      if (newStage === 'Meeting') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Skip weekends
        if (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate() + 1);
        if (tomorrow.getDay() === 6) tomorrow.setDate(tomorrow.getDate() + 2);
        
        const newMeeting = new Meeting({
          title: `${updated.company} — Discovery Call`,
          participants: [founderName, updated.name],
          date: tomorrow.toISOString().split('T')[0],
          time: '10:00',
          duration: 60,
          type: 'sales',
          notes: `Auto-created from CRM. Lead: ${updated.name} (${updated.company})\nDeal Value: ₹${(updated.value || 0).toLocaleString('en-IN')}`,
          actionItems: [],
          location: 'Google Meet',
          founderId: req.founderId,
          updatedBy: founderName
        });
        await newMeeting.save();
        
        await logActivity({ founderId: req.founderId, founderName, action: 'meeting_created', entityType: 'meeting', entityId: newMeeting._id, entityName: newMeeting.title, details: `Scheduled meeting with ${updated.name} from ${updated.company}`, icon: '📅' });
        await createNotification({ type: 'meeting_created', title: 'Meeting Scheduled', message: `Discovery call with ${updated.company} scheduled for ${tomorrow.toISOString().split('T')[0]}`, priority: 'medium', icon: '📅', sourceFounderId: req.founderId, sourceFounderName: founderName, entityType: 'meeting', entityId: newMeeting._id });
      }
      
      // --- Stage → Proposal: Auto-create editable draft invoice ---
      if (newStage === 'Proposal') {
        const newTx = new Transaction({
          type: 'revenue',
          amount: updated.value || 0,
          category: 'Project',
          description: `${updated.company} — Proposal Invoice (Draft)`,
          date: new Date().toISOString().split('T')[0],
          status: 'pending',
          client: updated.company,
          invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
          founderId: req.founderId,
          updatedBy: founderName
        });
        await newTx.save();
        
        await logActivity({ founderId: req.founderId, founderName, action: 'invoice_created', entityType: 'transaction', entityId: newTx._id, entityName: `Invoice for ${updated.company}`, details: `Draft invoice ₹${(updated.value || 0).toLocaleString('en-IN')} created for ${updated.company}`, icon: '💰' });
        await createNotification({ type: 'invoice_created', title: 'Draft Invoice Created', message: `₹${(updated.value || 0).toLocaleString('en-IN')} invoice created for ${updated.company} proposal`, priority: 'low', icon: '💰', sourceFounderId: req.founderId, sourceFounderName: founderName, entityType: 'transaction', entityId: newTx._id });
      }
      
      // --- Stage → Won: THE BIG ONE ---
      if (newStage === 'Won') {
        // 1. Auto-create client
        let existingClient = null;
        if (updated.company) {
          existingClient = await Client.findOne({ company: updated.company });
        }
        let clientDoc;
        if (!existingClient) {
          const renewalDate = new Date();
          renewalDate.setFullYear(renewalDate.getFullYear() + 1);
          clientDoc = new Client({
            founderId: req.founderId,
            name: updated.name,
            company: updated.company,
            email: updated.email,
            phone: updated.phone,
            status: 'active',
            totalRevenue: 0,
            contractValue: updated.value || 0,
            joinedDate: new Date().toISOString().split('T')[0],
            renewalDate: renewalDate.toISOString().split('T')[0],
            tags: updated.tags || [],
            industry: '',
            updatedBy: founderName
          });
          await clientDoc.save();
          
          await logActivity({ founderId: req.founderId, founderName, action: 'client_created', entityType: 'client', entityId: clientDoc._id, entityName: updated.company, details: `New client ${updated.company} created from won deal`, icon: '👤' });
          await createNotification({ type: 'client_created', title: 'New Client Added', message: `${updated.company} is now an active client!`, priority: 'medium', icon: '👤', sourceFounderId: req.founderId, sourceFounderName: founderName, entityType: 'client', entityId: clientDoc._id });
        } else {
          clientDoc = existingClient;
        }
        
        // 2. Auto-create project with template tasks
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 30);
        const templateTasks = await generateSmartTasks(`${updated.company} Project`, updated.company, updated.value || 0);
        
        const newProject = new Project({
          founderId: req.founderId,
          name: `${updated.company} Project`,
          client: updated.company,
          status: 'planning',
          priority: updated.value >= 200000 ? 'high' : 'medium',
          assignees: [founderName],
          progress: 0,
          startDate: new Date().toISOString().split('T')[0],
          deadline: deadline.toISOString().split('T')[0],
          description: `Auto-generated from CRM won deal. Contact: ${updated.name} (${updated.email})`,
          budget: updated.value || 0,
          spent: 0,
          tasks: templateTasks,
          updatedBy: founderName
        });
        await newProject.save();
        
        // Link project to client
        if (clientDoc) {
          await Client.findByIdAndUpdate(clientDoc._id, { $push: { projectIds: newProject._id } });
        }
        
        await logActivity({ founderId: req.founderId, founderName, action: 'project_created', entityType: 'project', entityId: newProject._id, entityName: newProject.name, details: `Project created for ${updated.company} with 5 template tasks`, icon: '📋' });
        
        // 3. Auto-create revenue invoice (if not already created at Proposal stage)
        const existingInvoice = await Transaction.findOne({ client: updated.company, type: 'revenue', description: { $regex: /Proposal Invoice/ } });
        if (!existingInvoice) {
          const newTx = new Transaction({
            type: 'revenue',
            amount: updated.value || 0,
            category: 'Project',
            description: `${updated.company} — Project Payment`,
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
            client: updated.company,
            invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
            founderId: req.founderId,
            updatedBy: founderName
          });
          await newTx.save();
          
          await logActivity({ founderId: req.founderId, founderName, action: 'invoice_created', entityType: 'transaction', entityId: newTx._id, entityName: `Invoice for ${updated.company}`, details: `₹${(updated.value || 0).toLocaleString('en-IN')} invoice auto-created`, icon: '💵' });
        }
        
        // 4. Award XP to the closer
        const founder = await Founder.findById(req.founderId);
        if (founder) {
          founder.xp = (founder.xp || 0) + 200;
          founder.level = Math.floor(founder.xp / 1000) + 1;
          await founder.save();
          
          await createNotification({ type: 'xp_earned', title: 'XP Earned!', message: `+200 XP for closing ${updated.company} deal!`, priority: 'low', icon: '⚡', targetFounderId: req.founderId, sourceFounderId: req.founderId, sourceFounderName: founderName });
        }
        
        // 5. Deal won notification (visible to everyone)
        await logActivity({ founderId: req.founderId, founderName, action: 'deal_won', entityType: 'lead', entityId: updated._id, entityName: updated.company, details: `${founderName} closed ${updated.company} for ₹${(updated.value || 0).toLocaleString('en-IN')}`, metadata: { value: updated.value }, icon: '🏆' });
        await createNotification({ type: 'deal_won', title: '🎉 Deal Won!', message: `${founderName} closed ${updated.company} — ₹${(updated.value || 0).toLocaleString('en-IN')}!`, priority: 'high', icon: '🏆', sourceFounderId: req.founderId, sourceFounderName: founderName, entityType: 'lead', entityId: updated._id });
      }
      
      // --- Stage → Lost ---
      if (newStage === 'Lost') {
        await logActivity({ founderId: req.founderId, founderName, action: 'deal_lost', entityType: 'lead', entityId: updated._id, entityName: updated.company, details: `Deal lost: ${updated.company}. Reason: ${updated.lostReason || 'Not specified'}`, icon: '❌' });
        
        await createNotification({ type: 'deal_lost', title: 'Deal Lost', message: `${updated.company} deal lost. ${updated.lostReason ? 'Reason: ' + updated.lostReason : 'Consider logging the reason.'}`, priority: 'medium', icon: '❌', sourceFounderId: req.founderId, sourceFounderName: founderName, entityType: 'lead', entityId: updated._id });
        
        // Schedule re-engage reminder for 30 days
        const reEngageDate = new Date();
        reEngageDate.setDate(reEngageDate.getDate() + 30);
        await createNotification({ type: 're_engage', title: 'Re-engage Lead', message: `It\'s been 30 days since ${updated.company} was lost. Worth a follow-up?`, priority: 'medium', icon: '🔄', targetFounderId: req.founderId, sourceFounderId: req.founderId, sourceFounderName: founderName, entityType: 'lead', entityId: updated._id, scheduledFor: reEngageDate });
      }
      
      // Log any other stage change
      if (!['Won', 'Lost', 'Meeting', 'Proposal'].includes(newStage)) {
        await logActivity({ founderId: req.founderId, founderName, action: 'lead_stage_changed', entityType: 'lead', entityId: updated._id, entityName: updated.company, details: `${updated.company} moved from ${oldStage} → ${newStage}`, icon: '📊' });
      }
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
    const oldProject = await Project.findById(req.params.id);
    if (!oldProject) return res.status(404).json({ message: 'Project not found' });
    
    const updateData = { ...req.body, updatedBy: founderName };
    
    // Auto-calculate progress from tasks
    if (updateData.tasks && Array.isArray(updateData.tasks) && updateData.tasks.length > 0) {
      const doneTasks = updateData.tasks.filter(t => t.status === 'done').length;
      updateData.progress = Math.round((doneTasks / updateData.tasks.length) * 100);
      
      // Auto-complete project when progress hits 100%
      if (updateData.progress === 100 && oldProject.status !== 'completed') {
        updateData.status = 'completed';
        
        // Award XP to all assignees
        const assignees = updateData.assignees || oldProject.assignees || [];
        const xpPerFounder = Math.round(500 / Math.max(assignees.length, 1));
        for (const assigneeName of assignees) {
          const assigneeFounder = await Founder.findOne({ name: { $regex: new RegExp(`^${assigneeName}$`, 'i') } });
          if (assigneeFounder) {
            assigneeFounder.xp = (assigneeFounder.xp || 0) + xpPerFounder;
            assigneeFounder.level = Math.floor(assigneeFounder.xp / 1000) + 1;
            await assigneeFounder.save();
            await createNotification({ type: 'xp_earned', title: 'XP Earned!', message: `+${xpPerFounder} XP for completing project ${oldProject.name}!`, priority: 'low', icon: '⚡', targetFounderId: assigneeFounder._id.toString() });
          }
        }
        
        // Update client satisfaction
        const isOnTime = new Date() <= new Date(oldProject.deadline);
        const client = await Client.findOne({ company: oldProject.client });
        if (client) {
          client.satisfaction = isOnTime ? Math.min(5, (client.satisfaction || 4) + 0.2) : Math.max(1, (client.satisfaction || 4) - 0.3);
          await client.save();
        }
        
        await logActivity({ founderId: req.founderId, founderName, action: 'project_completed', entityType: 'project', entityId: oldProject._id, entityName: oldProject.name, details: `Project ${oldProject.name} completed ${isOnTime ? 'on time! 🎯' : '(past deadline)'}`, icon: '✅' });
        await createNotification({ type: 'project_completed', title: '🎉 Project Completed!', message: `${oldProject.name} is now complete! ${isOnTime ? 'Delivered on time!' : ''}`, priority: 'high', icon: '✅', sourceFounderId: req.founderId, sourceFounderName: founderName, entityType: 'project', entityId: oldProject._id });
      }
    }
    
    // Check for over-budget
    if (updateData.spent && updateData.spent > (oldProject.budget || 0) && oldProject.spent <= oldProject.budget) {
      await createNotification({ type: 'over_budget', title: '⚠️ Over Budget', message: `${oldProject.name} has exceeded its budget of ₹${(oldProject.budget || 0).toLocaleString('en-IN')}`, priority: 'high', icon: '⚠️', sourceFounderId: req.founderId, sourceFounderName: founderName, entityType: 'project', entityId: oldProject._id });
    }
    
    const updated = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
    await logActivity({ founderId: req.founderId, founderName, action: saved.type === 'expense' ? 'expense_logged' : 'invoice_created', entityType: 'transaction', entityId: saved._id, entityName: saved.description, details: `${saved.type === 'expense' ? 'Expense' : 'Revenue'}: ₹${saved.amount.toLocaleString('en-IN')} — ${saved.description}`, icon: saved.type === 'expense' ? '📤' : '💵' });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/transactions/:id', requireFounder, async (req, res) => {
  try {
    const founderName = await getFounderName(req.founderId);
    const oldTx = await Transaction.findById(req.params.id);
    if (!oldTx) return res.status(404).json({ message: 'Transaction not found' });
    
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: founderName },
      { new: true }
    );
    
    // Invoice marked as paid: update client totalRevenue
    if (oldTx.status !== 'paid' && updated.status === 'paid' && updated.type === 'revenue' && updated.client) {
      await Client.findOneAndUpdate(
        { company: updated.client },
        { $inc: { totalRevenue: updated.amount } }
      );
      
      await logActivity({ founderId: req.founderId, founderName, action: 'invoice_paid', entityType: 'transaction', entityId: updated._id, entityName: `Invoice ${updated.invoiceNumber || ''}`, details: `₹${updated.amount.toLocaleString('en-IN')} received from ${updated.client}`, icon: '💰' });
      await createNotification({ type: 'invoice_paid', title: 'Payment Received!', message: `₹${updated.amount.toLocaleString('en-IN')} from ${updated.client} marked as paid`, priority: 'medium', icon: '💰', sourceFounderId: req.founderId, sourceFounderName: founderName, entityType: 'transaction', entityId: updated._id });
      
      // Award XP
      const founder = await Founder.findById(req.founderId);
      if (founder) {
        founder.xp = (founder.xp || 0) + 25;
        founder.level = Math.floor(founder.xp / 1000) + 1;
        await founder.save();
      }
    }
    
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
    const checkins = await DailyCheckin.find().sort({ createdAt: -1 });
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

// --- Meetings ---
router.get('/meetings', requireFounder, async (req, res) => {
  try {
    const meetings = await Meeting.find().sort({ date: -1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/meetings', requireFounder, async (req, res) => {
  try {
    const founderName = await getFounderName(req.founderId);
    const newMeeting = new Meeting({ ...req.body, founderId: req.founderId, updatedBy: founderName });
    const saved = await newMeeting.save();
    await logActivity({ founderId: req.founderId, founderName, action: 'meeting_created', entityType: 'meeting', entityId: saved._id, entityName: saved.title, details: `Meeting "${saved.title}" created`, icon: '📅' });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/meetings/:id', requireFounder, async (req, res) => {
  try {
    const founderName = await getFounderName(req.founderId);
    const updated = await Meeting.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: founderName }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Meeting not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/meetings/:id', requireFounder, async (req, res) => {
  try {
    await Meeting.findByIdAndDelete(req.params.id);
    res.json({ message: 'Meeting deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Activity Log (read-only) ---
router.get('/activity', requireFounder, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const activities = await ActivityLog.find().sort({ createdAt: -1 }).limit(limit);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Notifications ---
router.get('/notifications', requireFounder, async (req, res) => {
  try {
    const now = new Date();
    // Return notifications that are either fired OR whose scheduledFor has passed
    const notifications = await NotificationModel.find({
      $or: [
        { fired: true },
        { scheduledFor: { $lte: now } }
      ]
    }).sort({ createdAt: -1 }).limit(50);
    
    // Mark scheduled ones as fired
    await NotificationModel.updateMany({ scheduledFor: { $lte: now }, fired: false }, { fired: true });
    
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/notifications/:id/read', requireFounder, async (req, res) => {
  try {
    const updated = await NotificationModel.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/notifications/read-all', requireFounder, async (req, res) => {
  try {
    await NotificationModel.updateMany({ read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- AI Assistant ---
router.post('/ai/chat', requireFounder, async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });
    
    const reply = await getAiInsights(prompt, context || {});
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/ai/draft-checkin', requireFounder, async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivities = await ActivityLog.find({ 
      founderId: req.founderId,
      createdAt: { $gte: twentyFourHoursAgo } 
    }).sort({ createdAt: -1 });

    const activities = recentActivities.map(a => a.details);
    const draft = await generateDraftCheckin(activities);
    res.json({ draft });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

