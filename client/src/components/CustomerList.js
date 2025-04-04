import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Table, Form, Button } from 'react-bootstrap'; // Import Button and Form
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'; // Import icons

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [customersWithTodayMeeting, setCustomersWithTodayMeeting] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filter, setFilter] = useState('All');
    const [customerTypeFilter, setCustomerTypeFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const [customerTypes, setCustomerTypes] = useState([]);

    const [showTodayMeetings, setShowTodayMeetings] = useState(false);
    const [filteredCustomers, setFilteredCustomers] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomers();
        fetchCustomerTypes();
    }, []);

    useEffect(() => {
        // Apply filters whenever dependencies change
        applyFilters();
    }, [customers, filter, customerTypeFilter, searchQuery, showTodayMeetings, customersWithTodayMeeting]);

    const applyFilters = () => {
        let filtered = showTodayMeetings ? [...customersWithTodayMeeting] : [...customers];

        // Apply filters
        filtered = filtered.filter((customer) => {
            const statusMatch = filter === 'All' || customer.latestStatus === filter;
            const typeMatch = customerTypeFilter === 'All' || customer.customerType === customerTypeFilter;
            const nameMatch = customer.name.toLowerCase().includes(searchQuery.toLowerCase());
            return statusMatch && typeMatch && nameMatch;
        });

        setFilteredCustomers(filtered);
    };

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/customers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const cust = response.data;
            console.log("customer List", cust);
            // Get today's date (ignoring time)
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            // Filter customers with a meeting today
            const todayCustomers = response.data.filter(customer => {
                if (!customer.meetingDate || !customer.meetingDate.meetingDate) return false;
                const meetingDate = new Date(customer.meetingDate.meetingDate);
                meetingDate.setUTCHours(0, 0, 0, 0);
                return meetingDate.getTime() === today.getTime();
            });

            console.log("Customer meeting Dates..", todayCustomers);
            setCustomers(response.data);
            setCustomersWithTodayMeeting(todayCustomers);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            setError('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerTypes = async () => {
        try {
            const response = await axios.get(`${API_URL}/customertypes`);
            setCustomerTypes(response.data);
        } catch (error) {
            console.error('Failed to fetch customer types:', error);
        }
    };

    const handleViewDetails = (id) => {
        navigate(`/project-status/${id}`);
    };

    const handleEdit = (id) => {
        navigate(`/edit-customer/${id}`);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/customers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            fetchCustomers();
        } catch (error) {
            console.error('Failed to delete customer:', error);
            setError('Failed to delete customer');
        }
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    const handleCustomerTypeFilterChange = (e) => {
        setCustomerTypeFilter(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const toggleTodayMeetings = () => {
        setShowTodayMeetings(!showTodayMeetings);
        // Reset filters when toggling between all customers and today's meetings
        if (!showTodayMeetings) { // Reset filters when switching to "Show Today's Meetings"
            setFilter('All');
            setCustomerTypeFilter('All');
            setSearchQuery('');
        }
    };


    if (loading) return <p className="text-center">Loading...</p>;
    if (error) return <p className="text-danger text-center">{error}</p>;

    // SAP Theme Styling
    const themeStyles = {
        container: {
            backgroundColor: '#f8f9fa', // Light gray background
            padding: '20px',
            borderRadius: '10px',
        },
        heading: {
            color: '#003f7a', // SAP Blue
            marginBottom: '20px',
            textAlign: 'center',
        },
        link: {
            color: '#0070ba', // SAP Blue - link color
            textDecoration: 'none',
        },
        filterSection: {
            marginBottom: '20px',
        },
        button: {
            color: 'white',
            transition: 'background-color 0.2s ease-in-out',
            borderColor: 'transparent', // Removing borders
            marginRight: '5px', // Add horizontal space between buttons, added
            padding: '6px', // Adjust padding for better icon appearance
            borderRadius: '4px', // Add some border radius
            display: 'inline-flex', // for centering icon
            alignItems: 'center', // Center icon vertically
            justifyContent: 'center', // Center icon horizontally
            width: '30px',       // Fixed width for the icon buttons
            height: '30px',      // Fixed height for the icon buttons
        },
        buttonView: {
            backgroundColor: '#17a2b8', // Teal - Sober color
        },
        buttonEdit: {
            backgroundColor: '#ffc107', // Bootstrap Warning
            color: 'black' // set text color to black
        },
        buttonDelete: {
            backgroundColor: '#e0a8a8', // Light Red - Sober color
            color: 'black'
        },
        tableHead: {
            backgroundColor: '#003f7a', // Darker SAP Blue for the table header
            color: 'white',
        },
        alert: {
            borderRadius: '5px',
            marginBottom: '15px',
        },
    };

    return (
        <Container fluid style={themeStyles.container}>
            <Row>
                <Col>
                    <h2 style={themeStyles.heading}>Customer List</h2>

                    <div style={themeStyles.filterSection}>
                        <Row className="mb-2">
                            <Col xs={12} md={4} className="mb-2 mb-md-0">
                                <Form.Control
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </Col>
                            <Col xs={12} md={4} className="mb-2 mb-md-0">
                                <Form.Select
                                    value={customerTypeFilter}
                                    onChange={handleCustomerTypeFilterChange}
                                >
                                    <option value="All">All Types</option>
                                    {customerTypes.map((type) => (
                                        <option key={type._id} value={type.name}>
                                            {type.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col xs={12} md={4}>
                                <Form.Select
                                    value={filter}
                                    onChange={handleFilterChange}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Enquiry">Enquiry</option>
                                    <option value="Design & Quotation">Design & Quotation</option>
                                    <option value="Order Done">Order Done</option>
                                </Form.Select>
                            </Col>
                        </Row>

                        <Button variant="info" onClick={toggleTodayMeetings} className="mt-2">
                            {showTodayMeetings ? 'Show All Customers' : 'Show Customers with Today\'s Meeting'}
                        </Button>
                    </div>

                    <Link to="/customer-type-config" style={themeStyles.link}>Manage Customer Types</Link>
                    <Link to="/report" style={themeStyles.link}>Generate Report</Link>
                    {filteredCustomers.length === 0 ? (
                        <p className="text-center mt-3">No customers found matching the current filters.</p>
                    ) : (
                        <div className="table-responsive">
                            <Table striped bordered hover className="mt-3">
                                <thead style={themeStyles.tableHead}>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Contact</th>
                                        <th>Customer Type</th>
                                        <th>Status</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer._id}>
                                            <td>{customer.name}</td>
                                            <td>{customer.email}</td>
                                            <td>{customer.contactNumber}</td>
                                            <td>{customer.customerType}</td>
                                            <td>{customer.latestStatus || 'No Status'}</td>
                                            <td className="text-center">
                                                <span
                                                    onClick={() => handleViewDetails(customer._id)}
                                                    style={{ ...themeStyles.button, ...themeStyles.buttonView }}
                                                    title="View" // Add title attribute for tooltip
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </span>
                                                <span
                                                    onClick={() => handleEdit(customer._id)}
                                                    style={{ ...themeStyles.button, ...themeStyles.buttonEdit }}
                                                    title="Edit" // Add title attribute for tooltip
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </span>
                                                <span
                                                    onClick={() => handleDelete(customer._id)}
                                                    style={{ ...themeStyles.button, ...themeStyles.buttonDelete }}
                                                    title="Delete" // Add title attribute for tooltip
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default CustomerList;