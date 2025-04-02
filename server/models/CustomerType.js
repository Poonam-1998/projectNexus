import mongoose from 'mongoose';

const customerTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const CustomerType = mongoose.model('CustomerType', customerTypeSchema);

export default CustomerType;
