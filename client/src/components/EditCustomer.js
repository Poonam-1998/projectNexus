// client/src/components/EditCustomer.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

const EditCustomer = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    contactNumber: '',
    address: '',
    customerType: 'End User',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomer(response.data);
      } catch (error) {
        console.error('Failed to fetch customer:', error);
        setError('Failed to fetch customer');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomer({ ...customer, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/customers/${id}`, customer, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to update customer:', error);
      setError('Failed to update customer');
    }
  };

  // Styles
  const containerStyle = {
    maxWidth: '600px',
    margin: '20px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    fontFamily: 'Arial, sans-serif',
  };

  const headingStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#333',
  };

  const formGroupStyle = {
    marginBottom: '15px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#555',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  };

  const selectStyle = {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
    backgroundColor: 'white',
  };

  const buttonStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '12px 20px',
    fontSize: '18px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  };

  const errorStyle = {
    color: 'red',
    marginBottom: '10px',
    textAlign: 'center',
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={errorStyle}>{error}</p>;

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Edit Customer</h2>
      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Name:</label>
          <input
            type="text"
            name="name"
            value={customer.name}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Email:</label>
          <input
            type="email"
            name="email"
            value={customer.email}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Contact:</label>
          <input
            type="text"
            name="contactNumber"
            value={customer.contactNumber}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Address:</label>
          <input
            type="text"
            name="address"
            value={customer.address}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Type:</label>
          <select
            name="customerType"
            value={customer.customerType}
            onChange={handleChange}
            style={selectStyle}
          >
            <option value="End User">End User</option>
            <option value="Architect">Architect</option>
            <option value="Interior Designer">Interior Designer</option>
            <option value="Broker">Broker</option>
          </select>
        </div>

        <button style={buttonStyle} type="submit">Save</button>
      </form>
    </div>
  );
};

export default EditCustomer;