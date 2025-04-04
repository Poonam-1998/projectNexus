import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { Container, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Report = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [dateFilter, setDateFilter] = useState(null);
    const [monthFilter, setMonthFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [filteredReportData, setFilteredReportData] = useState([]);
    const [pdfData, setPdfData] = useState('');

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const calculateReportData = (data) => {
        let totalAmount = 0, totalPaidAmount = 0;
        data.forEach(item => {
            totalAmount += parseFloat(item.projectStatus?.totalAmount) || 0;
            totalPaidAmount += parseFloat(item.projectStatus?.paidAmount) || 0;
        });
        return { totalAmount, totalPaidAmount, totalDueAmount: totalAmount - totalPaidAmount };
    };

    const fetchReportData = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const customersResponse = await axios.get(`${API_URL}/customers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const customers = customersResponse.data;

            const combinedData = await Promise.all(
                customers.map(async (customer) => {
                    try {
                        const projectStatusResponse = await axios.get(`${API_URL}/project-status/${customer._id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        return { ...customer, projectStatus: projectStatusResponse.data };
                    } catch {
                        return { ...customer, projectStatus: null };
                    }
                })
            );

            setReportData(combinedData);
        } catch (err) {
            setError('Failed to fetch report data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        applyFilters();
    }, [reportData, filterType, dateFilter, monthFilter, yearFilter]);

    const applyFilters = () => {
        if (!reportData) return setFilteredReportData([]);

        let filtered = reportData.filter(item => (parseFloat(item.projectStatus?.totalAmount) || 0) !== 0);

        if (filterType === 'date' && dateFilter) {
            const filterDate = new Date(dateFilter);
            filtered = filtered.filter(item => {
                const meetingDate = new Date(item.projectStatus?.meetingDate);
                return (
                    meetingDate.getFullYear() === filterDate.getFullYear() &&
                    meetingDate.getMonth() === filterDate.getMonth() &&
                    meetingDate.getDate() === filterDate.getDate()
                );
            });
        } else if (filterType === 'month' && monthFilter) {
            filtered = filtered.filter(item => {
                const meetingDate = new Date(item.projectStatus?.meetingDate);
                return meetingDate.getMonth() + 1 === parseInt(monthFilter, 10);
            });
        } else if (filterType === 'year' && yearFilter) {
            filtered = filtered.filter(item => {
                const meetingDate = new Date(item.projectStatus?.meetingDate);
                return meetingDate.getFullYear() === parseInt(yearFilter, 10);
            });
        }

        setFilteredReportData(filtered);
    };

    const handleGenerateReport = () => {
        fetchReportData();
        setPdfData('');
    };

    const downloadReport = () => {
        if (!filteredReportData.length) {
            alert('No data to generate the report.');
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Customer Report', 40, 50);

        const headers = ['Name', 'Total Amount', 'Paid Amount', 'Due Amount', 'Meeting Date'];

        const data = filteredReportData.map(customer => [
            customer.name,
            `$${(parseFloat(customer.projectStatus?.totalAmount) || 0).toFixed(2)}`,
            `$${(parseFloat(customer.projectStatus?.paidAmount) || 0).toFixed(2)}`,
            `$${(parseFloat(customer.projectStatus?.totalAmount || 0) - parseFloat(customer.projectStatus?.paidAmount || 0)).toFixed(2)}`,
            customer.projectStatus?.meetingDate ? formatDate(customer.projectStatus.meetingDate) : "N/A",
        ]);

        doc.autoTable({ head: [headers], body: data, startY: 70 });

        setPdfData(doc.output('datauristring'));
    };

    const reportTotals = calculateReportData(filteredReportData);

    return (
        <Container className="mt-4">
            <h2>Report Generation</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="mb-3">
                <Col md={3}>
                    <Form.Group controlId="filterType">
                        <Form.Label>Filter By:</Form.Label>
                        <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="all">All Time</option>
                            <option value="date">Date</option>
                            <option value="month">Month</option>
                            <option value="year">Year</option>
                        </Form.Select>
                    </Form.Group>
                </Col>

                {filterType === 'date' && (
                    <Col md={3}>
                        <Form.Group controlId="dateFilter">
                            <Form.Label>Select Date:</Form.Label>
                            <DatePicker selected={dateFilter} onChange={setDateFilter} dateFormat="MM/dd/yyyy" className="form-control" />
                        </Form.Group>
                    </Col>
                )}

                {filterType === 'month' && (
                    <Col md={3}>
                        <Form.Group controlId="monthFilter">
                            <Form.Label>Select Month:</Form.Label>
                            <Form.Control as="select" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                                <option value="">Select Month</option>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{new Date(2023, i, 1).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                )}

                {filterType === 'year' && (
                    <Col md={3}>
                        <Form.Group controlId="yearFilter">
                            <Form.Label>Enter Year:</Form.Label>
                            <Form.Control type="number" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} />
                        </Form.Group>
                    </Col>
                )}

                <Col md={3} className="d-flex align-items-end">
                    <Button variant="primary" onClick={handleGenerateReport} disabled={loading}>
                        {loading ? 'Generating...' : 'Generate Report'}
                    </Button>
                    <Button variant="success" onClick={downloadReport} className="ms-2" disabled={!filteredReportData.length}>
                        Preview
                    </Button>
                    {pdfData && <a href={pdfData} download="customer_report.pdf" className="btn btn-primary ms-2">Download PDF</a>}
                </Col>
            </Row>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Total Amount</th>
                        <th>Paid Amount</th>
                        <th>Due Amount</th>
                        <th>Meeting Date</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredReportData.map((customer) => (
                        <tr key={customer._id}>
                            <td>{customer.name}</td>
                            <td>${customer.projectStatus?.totalAmount || 0}</td>
                            <td>${customer.projectStatus?.paidAmount || 0}</td>
                            <td>${(customer.projectStatus?.totalAmount || 0) - (customer.projectStatus?.paidAmount || 0)}</td>
                            <td>{customer.projectStatus?.meetingDate ? formatDate(customer.projectStatus.meetingDate) : "N/A"}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default Report;
