import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  type: { 
    type: String, 
    required: true, 
    enum: [
      'deal_won', 'deal_lost', 're_engage',
      'invoice_created', 'invoice_paid', 'invoice_overdue',
      'project_created', 'project_completed', 'deadline_warning', 'deadline_missed', 'over_budget',
      'client_created', 'renewal_reminder',
      'meeting_created',
      'checkin_reminder', 'task_completed',
      'xp_earned', 'level_up',
      'system'
    ]
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  icon: { type: String, default: '🔔' },
  read: { type: Boolean, default: false },
  // Who should see this notification (empty = everyone)
  targetFounderId: { type: String },
  // Who triggered this notification
  sourceFounderId: { type: String },
  sourceFounderName: { type: String },
  // Link to related entity
  entityType: { type: String }, // 'lead', 'project', 'client', 'transaction'
  entityId: { type: String },
  // For scheduled notifications (e.g. re-engage in 30 days)
  scheduledFor: { type: Date },
  fired: { type: Boolean, default: true } // false = scheduled for future
}, {
  timestamps: true
});

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ targetFounderId: 1, read: 1 });
notificationSchema.index({ scheduledFor: 1, fired: 1 });

export default mongoose.model('Notification', notificationSchema);
