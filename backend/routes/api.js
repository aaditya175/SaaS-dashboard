import express from 'express';
import Founder from '../models/Founder.js';
import Lead from '../models/Lead.js';
import Project from '../models/Project.js';
import Client from '../models/Client.js';
import DailyCheckin from '../models/DailyCheckin.js';
import KnowledgeBaseArticle from '../models/KnowledgeBaseArticle.js';

const router = express.Router();

// Middleware to extract founderId from query or headers
const requireFounder = (req, res, next) => {
  const founderId = req.headers['x-founder-id'] || req.query.founderId;
  if (!founderId) {
    return res.status(400).json({ message: 'founderId is required' });
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

router.post('/founders', async (req, res) => {
  try {
    const newFounder = new Founder(req.body);
    const saved = await newFounder.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Leads (CRM) ---
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
    const founder = await Founder.findById(req.founderId);
    const newLead = new Lead({ ...req.body, founderId: req.founderId, updatedBy: founder ? founder.name : 'Unknown' });
    const saved = await newLead.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/leads/:id', requireFounder, async (req, res) => {
  try {
    const founder = await Founder.findById(req.founderId);
    const updated = await Lead.findOneAndUpdate(
      { _id: req.params.id },
      { ...req.body, updatedBy: founder ? founder.name : 'Unknown' },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Projects ---
router.get('/projects', requireFounder, async (req, res) => {
  try {
    const projects = await Project.find({ founderId: req.founderId });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/projects', requireFounder, async (req, res) => {
  try {
    const newProject = new Project({ ...req.body, founderId: req.founderId });
    const saved = await newProject.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/projects/:id', requireFounder, async (req, res) => {
  try {
    const updated = await Project.findOneAndUpdate(
      { _id: req.params.id, founderId: req.founderId },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Clients ---
router.get('/clients', requireFounder, async (req, res) => {
  try {
    const clients = await Client.find({ founderId: req.founderId });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/clients', requireFounder, async (req, res) => {
  try {
    const newClient = new Client({ ...req.body, founderId: req.founderId });
    const saved = await newClient.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
