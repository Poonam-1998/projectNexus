// client/src/components/PrivateRoute.js
import React, { useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;