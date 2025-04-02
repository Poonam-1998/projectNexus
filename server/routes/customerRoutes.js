// server/routes/customerRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import protect from '../middleware/authMiddleware.js';
import Customer from '../models/Customer.js';
import ProjectStatus from '../models/ProjectStatus.js';

const router = express.Router();


// ✅ 1. CREATE a New Customer
// @route   POST api/customers
// @desc    Create a new customer
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        console.log('User ID:', req.user.id);  // Confirm the ID is extracted

        const { name, customerType, address, contactNumber, email, notes } = req.body;

        const newCustomer = new Customer({
            name,
            customerType,
            address,
            contactNumber,
            email,
            notes,
            user_id: req.user.id,    // ✅ Use the extracted `user_id`
            created_at: new Date()
        });

        const savedCustomer = await newCustomer.save();

        res.status(201).json(savedCustomer);
    } catch (error) {
        console.error('POST /api/customers - Error:', error);
        res.status(500).json({ message: 'Failed to create customer', error });
    }
});


// ✅ 2. GET All Customers with Latest Project Status
// @route   GET api/customers
// @desc    Get all customers for the logged-in user with latest project status
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        console.log('GET /api/customers - User ID:', req.user.id);

        const customers = await Customer.find({ user_id: req.user.id }).sort({
            created_at: -1,
        });

        // Fetch the latest status for each customer
        const customersWithStatus = await Promise.all(
            customers.map(async (customer) => {
                const latestStatus = await ProjectStatus.findOne({
                    customer: customer._id
                })
                .sort({ createdAt: -1 })   // Get the latest status by date
                .select('status');
                const meetingDate = await ProjectStatus.findOne({
                    customer: customer._id
                })
                .sort({ createdAt: -1 })   // Get the latest status by date
                .select('meetingDate');

                return {
                    ...customer._doc,  // Include customer details
                    latestStatus: latestStatus ? latestStatus.status : 'No status',
                    meetingDate,
                };
            })
        );

        res.json(customersWithStatus);

    } catch (err) {
        console.error('GET /api/customers - Error:', err.message);
        res.status(500).send('Server error');
    }
});


// ✅ 3. GET a Specific Customer by ID with Validation
// @route   GET api/customers/:id
// @desc    Get a specific customer by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Ensure the customer belongs to the logged-in user
        if (customer.user_id.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(customer);
    } catch (error) {
        console.error('GET /api/customers/:id - Error:', error);
        res.status(500).send('Server error');
    }
});


// ✅ 4. UPDATE a Customer
// @route   PUT api/customers/:id
// @desc    Update a customer
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const { name, address, contactNumber, email, customerType, notes } = req.body;

    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Ensure the customer belongs to the logged-in user
        if (customer.user_id.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        customer.name = name || customer.name;
        customer.address = address || customer.address;
        customer.contactNumber = contactNumber || customer.contactNumber;
        customer.email = email || customer.email;
        customer.customerType = customerType || customer.customerType;
        customer.notes = notes || customer.notes;

        const updatedCustomer = await customer.save();

        res.json(updatedCustomer);
    } catch (err) {
        console.error('PUT /api/customers/:id - Error:', err.message);
        res.status(500).send('Server error');
    }
});


// ✅ 5. DELETE a Customer
// @route   DELETE api/customers/:id
// @desc    Delete a customer
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Ensure the customer belongs to the logged-in user
        if (customer.user_id.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await customer.deleteOne();
        await ProjectStatus.deleteMany({ customer: req.params.id });
        res.json({ message: 'Customer removed' });
    } catch (err) {
        console.error('DELETE /api/customers/:id - Error:', err.message);
        res.status(500).send('Server error');
    }
});


// ✅ 6. GET Project Status for a Customer
// @route   GET api/customers/:id/status
// @desc    Get the latest project status for a specific customer
// @access  Private
router.get('/:id/status', protect, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        const projectStatus = await ProjectStatus.findOne({ customer: id })
            .sort({ createdAt: -1 });

        if (!projectStatus) {
            return res.status(404).json({ message: 'Project status not found' });
        }

        res.status(200).json(projectStatus);
    } catch (error) {
        console.error('GET /api/customers/:id/status - Error:', error);
        res.status(500).json({ message: 'Failed to fetch project status', error });
    }
});


export default router;
