// client/src/screens/HomeScreen.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CustomerList from '../components/CustomerList';

const HomeScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCreateCustomerClick = () => {
    navigate('/customers/new');
  };

  // Styles -  Organized into logical sections
  const containerStyle = {
    maxWidth: '1000px', // Adjust as needed
    margin: '0 auto',
    padding: '2rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif', // Consistent font
  };

  const headerStyle = {
    marginBottom: '2rem',
    textAlign: 'center',
    color: '#333',
  };

  const buttonStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '0.75rem 1.25rem',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginBottom: '1rem',
  };

  const buttonHoverStyle = {
    backgroundColor: '#3e8e41',
  };

  const customerListStyle = {
    // Add styles to control spacing or layout of the CustomerList itself
    marginTop: '1.5rem',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          Welcome, {user ? user.name : 'Guest'}!
        </h2>
      </div>

      <button
        style={{ ...buttonStyle, ...buttonHoverStyle }}
        onClick={handleCreateCustomerClick}
      >
        Create New Customer
      </button>

      <div style={customerListStyle}>
        <CustomerList />
      </div>

      <button
        style={{ ...buttonStyle, ...{ backgroundColor: '#d32f2f' } }} // Example: Logout button
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
};

export default HomeScreen;