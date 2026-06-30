import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  founderId: { type: String, required: true },
  updatedBy: { type: String },
  type: { type: String, required: true, enum: ['revenue', 'expense'] },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, required: true, enum: ['paid', 'pending', 'overdue'] },
  client: { type: String },
  invoiceNumber: { type: String }
}, {
  timestamps: true
});

export default mongoose.model('Transaction', transactionSchema);
