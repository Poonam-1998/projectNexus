import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const paymentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },  // ✅ Linked with customer
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Pending', 'Partially Paid', 'Paid'], default: 'Pending' },
  transactionHistory: [transactionSchema],
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
