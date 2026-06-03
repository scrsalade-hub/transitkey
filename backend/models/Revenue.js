import mongoose from 'mongoose';

const revenueSchema = new mongoose.Schema({
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  amount: { type: Number, required: true },
  expense: { type: Number, default: 0 },
  date: { type: Date, required: true },
  period: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' }
}, { timestamps: true });

export default mongoose.model('Revenue', revenueSchema);
