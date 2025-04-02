import express from 'express';
import PaymentHistory from '../models/PaymentHistory.js';
import ProjectStatus from '../models/ProjectStatus.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ POST Payment Route
router.post('/:projectId/payment', protect, async (req, res) => {
  const { projectId } = req.params;
  const { amount, status, paymentMethod, referenceId, remarks,user } = req.body;

  // Log the entire request body
  console.log('Request Body:', req.body);
  // Log the project ID
  console.log('Project ID from params:', projectId);
  // Log the user
  console.log('req.user BEFORE accessing _id:', req.user); // This is CRITICAL!

  const userId = user;  // Use optional chaining to prevent errors if req.user is null/undefined
  console.log('User ID:', user);

  try {
    const project = await ProjectStatus.findById(projectId);

    if (!project) {
      console.log('Project not found');
      return res.status(404).json({ message: 'Project not found' });
    }

    // ✅ Create a new payment record
    const payment = new PaymentHistory({
      project: projectId,
      user: userId,  // <--- This is the field causing the error. Make sure it's assigned correctly.
      customer: project.customer,
      amount,
      status,
      paymentMethod,
      referenceId,
      remarks
    });

    console.log('Payment object before save:', payment); // Log the payment object

    await payment.save();

    // ✅ Update the project status and paid amount
    project.paidAmount += parseFloat(amount);
    project.paymentStatus = project.paidAmount >= project.totalAmount ? 'Paid' : 'Partially Paid';

    await project.save();

    res.status(201).json({
      message: 'Payment added successfully',
      payment
    });

  } catch (error) {
    console.error('Error in payment route:', error); // More descriptive error message
    if (error.name === 'ValidationError') {
      console.error('Validation Error Details:', error.errors);  // Log validation errors
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ DELETE Payment Route
router.delete('/:paymentId', protect, async (req, res) => {
  const { paymentId } = req.params;

  try {
    const payment = await PaymentHistory.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    //  ✅ Get the project ID before deleting
    const projectId = payment.project;  // Assuming 'project' stores the ProjectStatus ID.

    // ✅ Delete the payment record
    await PaymentHistory.findByIdAndDelete(paymentId);

    // ✅ Update the ProjectStatus (Revert the paid amount)
    const project = await ProjectStatus.findById(projectId);
    if (project) {
      project.paidAmount -= payment.amount;
      project.paymentStatus = project.paidAmount >= project.totalAmount ? 'Paid' : 'Partially Paid';
      await project.save();
    }

    res.status(200).json({ message: 'Payment deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET Payment History by Project ID
router.get('/:projectId/history', protect, async (req, res) => {
  const { projectId } = req.params;

  try {
    const payments = await PaymentHistory.find({ project: projectId })
      .populate('user', 'name')            // ✅ Populate the user info
      .populate('customer', 'name');       // ✅ Populate the customer info

    res.status(200).json(payments);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;