import mongoose from 'mongoose';

const busSchema = new mongoose.Schema({
  busId: { type: String, unique: true, required: true },
  plateNumber: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  passengerCapacity: { type: Number, required: true },
  status: { type: String, enum: ['active', 'maintenance', 'retired'], default: 'active' },
  lastInspection: { type: Date, default: Date.now },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' }
}, { timestamps: true });

export default mongoose.model('Bus', busSchema);
