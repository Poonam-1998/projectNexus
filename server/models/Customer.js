// server/models/Customer.js
import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  contactNumber: {
    type: String,
  },
  email: {
    type: String,
  },
  customerType: { //Implement this
    type: String,
    //enum: ['End User', 'Architect', 'Interior Designer', 'Broker'],
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Customer = mongoose.model('Customer', CustomerSchema);

export default Customer;