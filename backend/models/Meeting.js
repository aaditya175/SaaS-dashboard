import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  title: { type: String, required: true },
  participants: [{ type: String }],
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: Number, default: 60 },
  type: { type: String, enum: ['internal', 'client', 'sales'] },
  notes: { type: String },
  actionItems: [{
    text: { type: String },
    assignee: { type: String },
    done: { type: Boolean, default: false }
  }],
  recordingUrl: { type: String },
  location: { type: String },
  founderId: { type: String },
  updatedBy: { type: String }
}, {
  timestamps: true
});

export default mongoose.model('Meeting', meetingSchema);
