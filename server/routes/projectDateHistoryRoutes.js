import express from 'express';
import ProjectStatus from '../models/ProjectStatus.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ POST payment to project status linked to user and customer
router.post('/:id/payment', protect, async (req, res) => {
  const { id } = req.params;  // ProjectStatus ID
  const { amount, status, customerId } = req.body;   // Include customerId
  const userId = req.user._id;  // Logged-in user ID

  try {
    const project = await ProjectStatus.findOne({
      _id: id,
      user: userId,           // ✅ Ensure it belongs to the user
      customer: customerId    // ✅ Validate customer ownership
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or not authorized' });
    }

    // ✅ Add payment entry
    const paymentEntry = {
      date: new Date(),
      amount: parseFloat(amount),
      status
    };

    project.paymentHistory.push(paymentEntry);
    project.paidAmount += parseFloat(amount);
    project.paymentStatus = project.paidAmount >= project.totalAmount ? 'Paid' : 'Partially Paid';

    await project.save();

    res.status(200).json({
      message: 'Payment added successfully',
      paymentHistory: project.paymentHistory,
      paidAmount: project.paidAmount,
      paymentStatus: project.paymentStatus
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
