import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  expenseType: { type: String, enum: ['fuel_purchase', 'park_levy', 'bus_repair', 'tyre_replacement', 'toll_fee', 'other'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  receiptUrl: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
