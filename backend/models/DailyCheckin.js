import mongoose from 'mongoose';

const dailyCheckinSchema = new mongoose.Schema({
  founderId: { type: String, required: true },
  founder: { type: String },
  date: { type: String },
  mood: { type: Number },
  completed: [{ type: String }],
  workingOn: [{ type: String }],
  blockers: { type: String },
  notes: { type: String }
}, {
  timestamps: true,
});

const DailyCheckin = mongoose.model('DailyCheckin', dailyCheckinSchema);

export default DailyCheckin;
