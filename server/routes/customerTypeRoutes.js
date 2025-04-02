import express from 'express';
import CustomerType from '../models/CustomerType.js';

const router = express.Router();

// ✅ Fetch all customer types
router.get('/', async (req, res) => {
  try {
    const types = await CustomerType.find();
    res.json(types);
  } catch (error) {
    console.error('Failed to fetch customer types:', error);
    res.status(500).send('Server error');
  }
});

// ✅ Add a new customer type
router.post('/', async (req, res) => {
  const { name } = req.body;

  try {
    const existingType = await CustomerType.findOne({ name });
    if (existingType) {
      return res.status(400).json({ message: 'Customer type already exists' });
    }

    const newType = new CustomerType({ name });
    await newType.save();
    res.status(201).json(newType);
  } catch (error) {
    console.error('Failed to add customer type:', error);
    res.status(500).send('Server error');
  }
});

// ✅ Update a customer type
router.put('/:id', async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  try {
    const updatedType = await CustomerType.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!updatedType) {
      return res.status(404).json({ message: 'Customer type not found' });
    }

    res.json(updatedType);
  } catch (error) {
    console.error('Failed to update customer type:', error);
    res.status(500).send('Server error');
  }
});

// ✅ Delete a customer type
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await CustomerType.findByIdAndDelete(id);
    res.status(200).send('Customer type deleted');
  } catch (error) {
    console.error('Failed to delete customer type:', error);
    res.status(500).send('Server error');
  }
});

export default router;
