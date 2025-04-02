import mongoose from 'mongoose';

const paymentHistorySchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectStatus', required: true },  // ✅ Reference the ProjectStatus
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },              // ✅ Track the user making the payment
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },      // ✅ Track the customer
  amount: { type: Number, required: true },  
  status: { type: String, enum: ['Paid', 'Partially Paid', 'Pending'], required: true },
  date: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI', 'Bank Transfer'], default: 'Cash' },  // ✅ Add payment method field
  referenceId: { type: String },           // ✅ Add reference ID for tracking payments (e.g., UPI ID, Transaction ID)
  remarks: { type: String }                 // ✅ Additional comments/remarks
},{ timestamps: true });

const PaymentHistory = mongoose.model('PaymentHistory', paymentHistorySchema);

export default PaymentHistory;
