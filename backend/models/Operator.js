import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const operatorSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  operatorId: { type: String, unique: true },
  role: { type: String, default: 'operator' }
}, { timestamps: true });

operatorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  if (!this.operatorId) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.operatorId = `TMS-OP-${randomNum}`;
  }
  next();
});

operatorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Operator', operatorSchema);
