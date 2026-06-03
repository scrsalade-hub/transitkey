import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'recipientModel' },
  recipientModel: { type: String, enum: ['User', 'Driver', 'Operator'], required: true },
  recipientRole: { type: String, enum: ['passenger', 'driver', 'operator'], required: true },
  type: { type: String, enum: ['emergency', 'route_update', 'system_alert', 'traffic_alert', 'operator_message', 'delay', 'fare_update', 'trip_update'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
