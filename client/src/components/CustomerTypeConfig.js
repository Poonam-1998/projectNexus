import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import 'bootstrap/dist/css/bootstrap.min.css';

const CustomerTypeConfig = () => {
  const [customerTypes, setCustomerTypes] = useState([]);
  const [newType, setNewType] = useState('');
  const [editType, setEditType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerTypes();
  }, []);

  const fetchCustomerTypes = async () => {
    try {
      const response = await axios.get(`${API_URL}/customertypes`);
      setCustomerTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch customer types:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCustomerType = async () => {
    if (!newType) return;

    try {
      await axios.post(`${API_URL}/customertypes`, { name: newType });
      setNewType('');
      fetchCustomerTypes();
    } catch (error) {
      console.error('Failed to add customer type:', error);
    }
  };

  const updateCustomerType = async (id) => {
    if (!editType) return;

    try {
      await axios.put(`${API_URL}/customertypes/${id}`, { name: editType });
      setEditType(null);
      fetchCustomerTypes();
    } catch (error) {
      console.error('Failed to update customer type:', error);
    }
  };

  const deleteCustomerType = async (id) => {
    if (!window.confirm('Are you sure you want to delete this type?')) return;

    try {
      await axios.delete(`${API_URL}/customertypes/${id}`);
      fetchCustomerTypes();
    } catch (error) {
      console.error('Failed to delete customer type:', error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mt-5">
      <h2>Manage Customer Types</h2>

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="New customer type"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
        />
        <button className="btn btn-success mt-2" onClick={addCustomerType}>
          Add Type
        </button>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Customer Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customerTypes.map((type) => (
            <tr key={type._id}>
              <td>
                {editType && editType._id === type._id ? (
                  <input
                    type="text"
                    className="form-control"
                    value={editType.name}
                    onChange={(e) =>
                      setEditType({ ...editType, name: e.target.value })
                    }
                  />
                ) : (
                  type.name
                )}
              </td>
              <td>
                {editType && editType._id === type._id ? (
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => updateCustomerType(type._id)}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => setEditType(type)}
                  >
                    Edit
                  </button>
                )}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteCustomerType(type._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTypeConfig;
