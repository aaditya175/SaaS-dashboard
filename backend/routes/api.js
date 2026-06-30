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
    res.json(founders);
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

router.put('/founders/:id', requireSuperAdmin, async (req, res) => {
  try {
    const updated = await Founder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Founder not found' });
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
    const newCheckin = new DailyCheckin({ ...req.body, founderId: req.founderId });
    const saved = await newCheckin.save();
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
