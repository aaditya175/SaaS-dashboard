import mongoose from 'mongoose';

const founderSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  role: { type: String, required: true },
  initials: { type: String, required: true },
  color: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  badges: [{ type: String }],
  revenue: { type: Number, default: 0 },
  outreach: { type: Number, default: 0 },
  meetings: { type: Number, default: 0 },
  score: { type: Number, default: 0 }
}, {
  timestamps: true,
});

const Founder = mongoose.model('Founder', founderSchema);

export default Founder;
