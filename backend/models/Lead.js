import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  founderId: { type: String, required: true },
  name: { type: String, required: true },
  company: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  value: { type: Number, default: 0 },
  stage: { type: String, enum: ['Lead', 'Contacted', 'Interested', 'Meeting', 'Proposal', 'Negotiation', 'Won', 'Lost'], default: 'Lead' },
  assignee: { type: String },
  tags: [{ type: String }],
  lastContact: { type: String },
  notes: { type: String },
  source: { type: String },
  lostReason: { type: String },
  updatedBy: { type: String }
}, {
  timestamps: true,
});

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
