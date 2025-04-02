// client/src/context/AuthContext.js
import { createContext, useState, useEffect } from 'react';
import API_URL from '../config';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    console.log('useEffect - storedToken:', storedToken); // Log storedToken

    if (storedToken) {
      setToken(storedToken);
      const fetchUser = async () => {
        try {
          console.log('Fetching user with token:', storedToken); // Log before fetch
          const response = await axios.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          console.log('User fetched successfully:', response.data); // Log success
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching user:', error);
          console.log('Error response:', error.response); // Log detailed error response
          setToken(null);
          localStorage.removeItem('token');
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else {
      console.log('No token found in localStorage.');
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Login attempt: email =', email); // Log email
      const response = await axios.post(`${API_URL}/users/login`, {
        email,
        password,
      });
      const newToken = response.data.token;
      console.log('Login successful, token:', newToken); // Log new token

      setToken(newToken);
      localStorage.setItem('token', newToken);

      console.log('Fetching user after login with token:', newToken);
      const userResponse = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      console.log('User fetched after login:', userResponse.data); // Log user data

      setUser(userResponse.data);

      return true; // Login success
    } catch (error) {
      console.error('Login failed:', error);
      console.log('Error response:', error.response); // Log detailed error response
      throw error; // Re-throw to handle in component
    }
  };

  const logout = () => {
    console.log('Logging out'); // Log logout
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const contextValue = {
    user,
    token,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};