import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  complainant: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'complainantType' },
  complainantType: { type: String, enum: ['passenger', 'driver'], required: true },
  category: { type: String, enum: ['vehicle_issue', 'route_issue', 'passenger_incident', 'driver_behavior', 'fare_dispute', 'other'], required: true },
  description: { type: String, required: true },
  urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
  status: { type: String, enum: ['open', 'in_review', 'resolved', 'closed'], default: 'open' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Operator' }
}, { timestamps: true });

export default mongoose.model('Complaint', complaintSchema);
