import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap'; // Import Bootstrap components

const CustomerForm = ({ onCustomerCreated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [customerType, setCustomerType] = useState('End User');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customerTypesOptions, setCustomerTypesOptions] = useState([]);
  const navigate = useNavigate();

  const fetchCustomerTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/customertypes`);
      const options = response.data.map(type => ({
        value: type.name,
        label: type.name,
      }));
      setCustomerTypesOptions(options);
    } catch (error) {
      console.error('Failed to fetch customer types:', error);
      setError('Failed to fetch customer types.');
    }
  };

  useEffect(() => {
    fetchCustomerTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/customers`,
        { name, email, address, contactNumber, customerType, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (onCustomerCreated) {
        onCustomerCreated(response.data);
      }

      navigate('/');

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create customer');
      console.error(err);
    }
  };

  // CSS for the SAP-inspired theme
  const themeStyles = {
    container: {
      backgroundColor: '#f8f9fa', // Light gray background
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
    },
    heading: {
      color: '#003f7a', // SAP Blue (or a similar shade)
      marginBottom: '20px',
      textAlign: 'center',
    },
    button: {
      backgroundColor: '#0070ba', // SAP Blue, darker
      borderColor: '#0070ba',
      color: 'white',
      transition: 'background-color 0.2s ease-in-out',
    },
    buttonHover: {
      backgroundColor: '#005493', // Slightly darker SAP Blue on hover
      borderColor: '#005493',
    },
    label: {
      fontWeight: 'bold',
      color: '#333',
    },
    alert: {
      borderRadius: '5px',
      marginBottom: '15px',
    }
  };

  return (
    <Container style={themeStyles.container}>
      <Row>
        <Col>
          <h2 style={themeStyles.heading}>Create Customer</h2>

          {error && <Alert variant="danger" style={themeStyles.alert}>{error}</Alert>}
          {success && <Alert variant="success" style={themeStyles.alert}>{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={themeStyles.label}>Name:</Form.Label>
              <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={themeStyles.label}>Email:</Form.Label>
              <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={themeStyles.label}>Address:</Form.Label>
              <Form.Control type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={themeStyles.label}>Contact Number:</Form.Label>
              <Form.Control type="text" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={themeStyles.label}>Customer Type:</Form.Label>
              <Form.Select value={customerType} onChange={(e) => setCustomerType(e.target.value)}>
                {customerTypesOptions.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={themeStyles.label}>Notes:</Form.Label>
              <Form.Control as="textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              style={{ ...themeStyles.button,
                  ...(themeStyles.buttonHover && { ':hover': themeStyles.buttonHover }) // Apply hover styles
              }}
            >
              Create Customer
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomerForm;