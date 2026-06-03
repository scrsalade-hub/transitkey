import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const driverSchema = new mongoose.Schema({
  accessToken: { type: String, unique: true, sparse: true },
  operatorCode: { type: String, unique: true, sparse: true },
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Operator' },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: '' },
  driverId: { type: String, unique: true },
  licenseType: { type: String, default: 'Commercial Driver License' },
  licenseNumber: { type: String, default: '' },
  licenseExpiry: { type: Date },
  status: { type: String, enum: ['active', 'inactive', 'suspended', 'probation'], default: 'active' },
  standing: { type: String, enum: ['good standing', 'probation', 'suspension'], default: 'good standing' },
  plateNumber: { type: String, default: '' },
  busType: { type: String, default: '' },
  assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  assignedRoute: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  vehicleClass: { type: String, default: '' },
  yearsOfExperience: { type: Number, default: 0 },
  role: { type: String, default: 'driver' },
  performance: {
    totalDistance: { type: Number, default: 0 },
    completedTrips: { type: Number, default: 0 },
    passengerRating: { type: Number, default: 5.0 }
  },
  notificationPreferences: {
    routeAssignmentAlerts: { type: Boolean, default: true },
    vehicleMaintenanceReminders: { type: Boolean, default: true },
    promotionsAndUpdates: { type: Boolean, default: false }
  }
}, { timestamps: true });

driverSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (!this.driverId) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.driverId = `TMS-DR-${randomNum}`;
  }
  next();
});

driverSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Driver', driverSchema);
