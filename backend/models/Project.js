import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  founderId: { type: String, required: true },
  name: { type: String, required: true },
  client: { type: String },
  status: { type: String, default: 'planning' },
  priority: { type: String, default: 'medium' },
  assignees: [{ type: String }],
  progress: { type: Number, default: 0 },
  startDate: { type: String },
  deadline: { type: String },
  description: { type: String },
  budget: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  tasks: [{ type: Object }],
  updatedBy: { type: String }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; } }
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
