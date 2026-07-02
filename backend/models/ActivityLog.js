import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  founderId: { type: String, required: true },
  founderName: { type: String, required: true },
  action: { type: String, required: true }, // 'deal_won', 'deal_lost', 'project_completed', 'task_completed', 'invoice_paid', 'expense_logged', 'client_created', 'meeting_created', 'checkin_submitted'
  entityType: { type: String, required: true }, // 'lead', 'project', 'client', 'transaction', 'meeting', 'checkin'
  entityId: { type: String },
  entityName: { type: String },
  details: { type: String }, // Human-readable description e.g. "Closed deal with Acme Corp for ₹3,00,000"
  metadata: { type: mongoose.Schema.Types.Mixed }, // Any extra data (amount, stage, etc.)
  icon: { type: String, default: '📋' }
}, {
  timestamps: true
});

// Index for quick lookups by date
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ founderId: 1, createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
