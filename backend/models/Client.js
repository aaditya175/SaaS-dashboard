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
  lastContact: { type: String }
}, {
  timestamps: true,
});

const Client = mongoose.model('Client', clientSchema);

export default Client;
