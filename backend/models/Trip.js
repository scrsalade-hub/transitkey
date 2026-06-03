import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  tripId: { type: String, unique: true, required: true },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'delayed', 'cancelled'], default: 'scheduled' },
  passengerLoad: { type: Number, default: 0 },
  passengerCapacity: { type: Number, default: 30 },
  startTime: { type: Date },
  endTime: { type: Date },
  currentStop: { type: String, default: '' },
  nextStop: { type: String, default: '' },
  completedStops: [{ type: String }],
  delayMinutes: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Trip', tripSchema);
