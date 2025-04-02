import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const CustomerPayments = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/payments/customer/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setPayments(response.data);
      } catch (error) {
        setError('Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [customerId]);

  const handleAddPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/payments/add-payment/${customerId}`, 
      { amount: paidAmount }, 
      { headers: { Authorization: `Bearer ${token}` } });

      alert('Payment Added Successfully');
      window.location.reload();

    } catch (error) {
      alert('Failed to add payment');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Customer Payments</h2>

      {payments.map((payment, index) => (
        <div key={index} className="card mb-3 shadow-sm p-3">
          <h4>Payment ID: {payment._id}</h4>
          <p><strong>Total Amount:</strong> ₹{payment.totalAmount}</p>
          <p><strong>Paid Amount:</strong> ₹{payment.paidAmount}</p>
          <p><strong>Remaining Amount:</strong> ₹{payment.remainingAmount}</p>
          <p>
            <strong>Status:</strong> 
            <span 
              className={`badge ${
                payment.paymentStatus === 'Paid' ? 'bg-success' :
                payment.paymentStatus === 'Partially Paid' ? 'bg-warning' :
                'bg-danger'
              }`}
            >
              {payment.paymentStatus}
            </span>
          </p>
        </div>
      ))}

      <div className="mb-3">
        <label>Total Amount:</label>
        <input 
          type="number" 
          className="form-control" 
          value={totalAmount} 
          onChange={(e) => setTotalAmount(e.target.value)} 
        />
      </div>

      <div className="mb-3">
        <label>Paid Amount:</label>
        <input 
          type="number" 
          className="form-control" 
          value={paidAmount} 
          onChange={(e) => setPaidAmount(e.target.value)} 
        />
      </div>

      <button onClick={handleAddPayment} className="btn btn-primary">Add Payment</button>
    </div>
  );
};

export default CustomerPayments;
