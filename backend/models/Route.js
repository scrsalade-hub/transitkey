import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
  routeId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  startTerminal: { type: String, required: true },
  endTerminal: { type: String, required: true },
  stops: [{ name: String, estimatedArrival: String }],
  distance: { type: Number, default: 0 },
  estimatedDuration: { type: Number, default: 0 },
  fare: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Operator' }
}, { timestamps: true });

export default mongoose.model('Route', routeSchema);
