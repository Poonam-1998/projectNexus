import mongoose from 'mongoose';

const projectStatusSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  name: { type: String, required: true },
  status: { type: String, required: true },
  feedback: { type: String },

  quotationFiles: [
    {
      path: { type: String, required: true },
      originalName: { type: String, required: true }  // ✅ Store original file name
    }
  ],
  imageFiles: [
    {
      path: { type: String, required: true },
      originalName: { type: String, required: true }
    }
  ],
  meetingDate: { type: Date },
  // ✅ Payment Fields
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, default: 'Pending' }
});

const ProjectStatus = mongoose.model('ProjectStatus', projectStatusSchema);

export default ProjectStatus;
