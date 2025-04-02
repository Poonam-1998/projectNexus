// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import CreateCustomerScreen from './screens/CreateCustomerScreen';
import PrivateRoute from './components/PrivateRoute';
import ProjectStatus from './components/ProjectStatus'; // Import ProjectStatus
import CustomerList from './components/CustomerList';
import CustomerTypeConfig from './components/CustomerTypeConfig';
import EditCustomer from './components/EditCustomer';


const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomeScreen />
              </PrivateRoute>
            }
          />
          <Route
            path="/project-status/:id"
            element={
              <PrivateRoute>
                <ProjectStatus />
              </PrivateRoute>
            }
          />
          <Route
            path="/customers/new"
            element={
              <PrivateRoute>
                <CreateCustomerScreen />
              </PrivateRoute>
            }
          />
        
  <Route path="/" element={<CustomerList />} />
  <Route path="/edit-customer/:id" element={<EditCustomer />} />


             {/* ✅ Define the routes */}
        <Route path="/" element={<CustomerList />} />
        <Route path="/customer-type-config" element={<CustomerTypeConfig />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;