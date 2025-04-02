import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spinner, Button, Table, Form, Container, Row, Col, Card } from 'react-bootstrap';

const AddPaymentForm = ({ projectStatus, setProjectStatus }) => {
  const projectId = projectStatus.project_id || projectStatus.id;
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // ✅ Default value, must match your enum
  const [referenceId, setReferenceId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const paymentMethods = ['Cash', 'Card', 'UPI', 'Bank Transfer']; // ✅ Array for dropdown options

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!projectId) {
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_URL}/payments/${projectId}/history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPaymentHistory(response.data);
      } catch (error) {
        console.error('Failed to fetch payment history:', error);
        alert('Failed to load payment history.');
      }
    };

    fetchPaymentHistory();
  }, [projectId]);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!paymentAmount || isNaN(parseFloat(paymentAmount)) || parseFloat(paymentAmount) <= 0) {
      alert('Invalid payment amount');
      setLoading(false);
      return;
    }

    if(paymentAmount>( projectStatus.totalAmount- projectStatus.paidAmount) )
        {
            alert('Payment amount you entered is more than Due amount');
            setLoading(false);
            return; 
        }
    const projectStatusId = projectStatus.project_id || projectStatus.id;
    const customerId = projectStatus.customer_id;
    const userId = projectStatus.user_id;

    if (!projectStatusId || !customerId || !userId) {
      console.error('Missing IDs!');
      alert('Failed to retrieve project, customer, or user ID');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/payments/${projectStatusId}/payment`,
        {
          amount: parseFloat(paymentAmount),
          paymentMethod, // Use the selected value
          referenceId,
          remarks,
          project: projectStatusId,
          customer: customerId,
          user: userId,
          status: parseFloat(paymentAmount) >= projectStatus.totalAmount ? 'Paid' : 'Partially Paid',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProjectStatus((prevStatus) => ({
        ...prevStatus,
        paidAmount: prevStatus.paidAmount + parseFloat(paymentAmount),
        paymentStatus:
          prevStatus.paidAmount + parseFloat(paymentAmount) >= prevStatus.totalAmount
            ? 'Paid'
            : 'Partially Paid',
      }));

      const paymentHistoryResponse = await axios.get(
        `${API_URL}/payments/${projectStatusId}/history`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setPaymentHistory(paymentHistoryResponse.data);

      alert('Payment added successfully!');

      setPaymentAmount('');
      setPaymentMethod('Cash'); // Reset to default
      setReferenceId('');
      setRemarks('');
      setShowForm(false);

    } catch (error) {
      console.error('Failed to add payment:', error);
      alert('Failed to add payment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPaymentHistory((prevHistory) =>
        prevHistory.filter((payment) => payment._id !== paymentId)
      );

      const deletedPayment = paymentHistory.find(payment => payment._id === paymentId);
      if (deletedPayment) {
        setProjectStatus((prevStatus) => ({
          ...prevStatus,
          paidAmount: prevStatus.paidAmount - deletedPayment.amount,
          paymentStatus: (prevStatus.paidAmount - deletedPayment.amount) >= prevStatus.totalAmount
            ? 'Paid'
            : 'Partially Paid',
        }));
      }

      alert('Payment deleted successfully!');

    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Failed to delete payment.');
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <Container className="my-4">
      {/* Add Payment Button */}
      <Button variant="primary" onClick={toggleForm} className="mb-3">
        Add Payment
      </Button>

      {/* Payment Form (conditionally rendered) */}
      {showForm && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h2 className="text-primary mb-4">Add Payment</h2>
            <Form onSubmit={handleAddPayment}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Payment Method</Form.Label>
                    <Form.Control
                      as="select"  // ✅ Use <Form.Control as="select">
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      required
                    >
                      {paymentMethods.map((method) => ( // ✅ Map the options
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Reference ID</Form.Label>
                    <Form.Control
                      type="text"
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Remarks</Form.Label>
                    <Form.Control
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Add Payment'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* Payment History Button */}
      <Button variant="secondary" onClick={toggleHistory} className="mb-3">
        {showHistory ? 'Hide Payment History' : 'Show Payment History'}
      </Button>

      {/* Payment History (conditionally rendered) */}
      {showHistory && (
        <Card className="shadow-sm">
          <Card.Body>
            <h2 className="text-primary mb-4">Payment History</h2>
            {paymentHistory.length === 0 ? (
              <p>No payment history yet.</p>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reference ID</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr key={payment._id}>
                      <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td>₹{payment.amount.toFixed(2)}</td>
                      <td>{payment.paymentMethod}</td>
                      <td>{payment.referenceId}</td>
                      <td>{payment.remarks}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeletePayment(payment._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default AddPaymentForm;