import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  founderId: { type: String, required: true },
  name: { type: String, required: true },
  company: { type: String },
  email: { type: String },
  phone: { type: String },
  website: { type: String },
  projectIds: [{ type: String }],
  status: { type: String, default: 'active' },
  totalRevenue: { type: Number, default: 0 },
  satisfaction: { type: Number, default: 5 },
  tags: [{ type: String }],
  lastContact: { type: String },
  contractValue: { type: Number, default: 0 },
  renewalDate: { type: String },
  industry: { type: String },
  notes: { type: String },
  joinedDate: { type: String },
  updatedBy: { type: String }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; } }
});

const Client = mongoose.model('Client', clientSchema);

export default Client;
