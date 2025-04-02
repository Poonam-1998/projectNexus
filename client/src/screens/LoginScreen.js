// client/src/screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
          <h2 style={headingStyle}>Login</h2>
        </div>
        <div style={contentStyle}>
          {error && <div style={errorStyle}>{error}</div>}
          <form onSubmit={handleSubmit}>
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
            <button style={buttonStyle} type="submit">
              Sign In
            </button>
          </form>
          <Link style={linkStyle} to="/register">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;