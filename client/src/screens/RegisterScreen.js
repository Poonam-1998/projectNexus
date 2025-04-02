// client/src/screens/RegisterScreen.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config';
import axios from 'axios';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await axios.post(`${API_URL}/users/register`, {
        name,
        email,
        password,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  // Styles
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f7f7f7',
    padding: '24px',
  };

  const formContainerStyle = {
    maxWidth: '400px',
    width: '100%',
    backgroundColor: '#fff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
  };

  const headerStyle = {
    padding: '16px 24px',
    backgroundColor: '#f2f2f2',
    borderBottom: '1px solid #ddd',
    textAlign: 'center',
  };

  const headingStyle = {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
  };

  const contentStyle = {
    padding: '24px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#555',
    marginBottom: '8px',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    marginBottom: '16px',
  };

  const errorStyle = {
    marginBottom: '16px',
    fontSize: '14px',
    color: '#c0392b',
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  };

  const linkStyle = {
    display: 'block',
    textAlign: 'center',
    marginTop: '16px',
    fontSize: '14px',
    color: '#3498db',
    textDecoration: 'none',
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <div style={headerStyle}>
          <h2 style={headingStyle}>Register</h2>
        </div>
        <div style={contentStyle}>
          {error && <div style={errorStyle}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div>
              <label style={labelStyle} htmlFor="name">
                Full name
              </label>
              <input
                style={inputStyle}
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="email">
                Email address
              </label>
              <input
                style={inputStyle}
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="password">
                Password
              </label>
              <input
                style={inputStyle}
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                style={inputStyle}
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button style={buttonStyle} type="submit">
              Register
            </button>
          </form>
          <Link style={linkStyle} to="/login">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;