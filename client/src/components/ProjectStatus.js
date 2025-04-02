import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useParams } from 'react-router-dom';
import './ProjectStatus.css';
import AddPaymentForm from './AddPaymentForm'; 

const ProjectStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [projectStatus, setProjectStatus] = useState({
    name: '',
    status: '',
    feedback: '',
    meetingDate: '',
    quotationFiles: [],
    imageFiles: [],
    totalAmount: 0,
    paidAmount: 0,
    paymentStatus: 'Pending',
    paymentHistory: [] 
  });

  
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quotations, setQuotations] = useState([]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchProjectStatus = async () => {
      if (!id) {
        setError('No customer ID found');
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_URL}/project-status/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const project = await axios.get(`${API_URL}/project-status/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Fetched Project Status:', data);  // ✅ Log the full response
        const response = await axios.get(`${API_URL}/customers/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const customer = response.data;  
          const dataProject = project.data;
          console.log("Here is the response:", customer);  // Correct syntax
          console.log("Project Status", dataProject);
           
        setProjectStatus({
          ...data,
          customer_id: customer._id,
          user_id: customer.user_id,  // ✅ Explicitly set the ID
          project_id: dataProject._id,
          name:customer.name,
          meetingDate: data.meetingDate || '',
          totalAmount: data.totalAmount || 0,
          paidAmount: data.paidAmount || 0,
          paymentStatus: calculatePaymentStatus(data.totalAmount, data.paidAmount),
          paymentHistory: data.paymentHistory || []
        });

        setSelectedDate(data.meetingDate ? new Date(data.meetingDate) : null);

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch project status');
      } finally {
        setLoading(false);
      }
    };
    fetchProjectStatus();
  }, [id]);

  const calculatePaymentStatus = (total, paid) => {
    const totalAmt = parseFloat(total);
    const paidAmt = parseFloat(paid);

    if (paidAmt >= totalAmt && totalAmt > 0) {
      return 'Paid';
    } else if (paidAmt > 0 && paidAmt < totalAmt) {
      return 'Partially Paid';
    } else {
      return 'Pending';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedStatus = {
      ...projectStatus,
      [name]: value
    };

    if (name === 'totalAmount' || name === 'paidAmount') {
      const total = parseFloat(updatedStatus.totalAmount);
      const paid = parseFloat(updatedStatus.paidAmount);
      updatedStatus.paymentStatus = calculatePaymentStatus(total, paid);
    }

    setProjectStatus(updatedStatus);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setProjectStatus({ ...projectStatus, meetingDate: date });
  };

  const handleFileChange = (e, fileType) => {
    const files = Array.from(e.target.files);
    if (fileType === 'quotations') {
      setQuotations(files);
    } else if (fileType === 'images') {
      setImages(files);
    }
  };

  
  const handleDeleteFile = async (fileUrl) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('No authentication token found.');
            return;
        }

        if (!fileUrl) {
            console.error('File URL is missing!');
            alert('Invalid file URL.');
            return;
        }

        console.log('🛠️ Full File URL:', fileUrl);

        // ✅ Extract the base path (remove token)
        const url = new URL(fileUrl);
        const basePath = url.pathname;   // `/api/project-status/files/67e68c27f92fc888dee14947/filename.pdf`
        console.log('🚩 Base Path without token:', basePath);

        const pathSegments = basePath.split('/');

        // ✅ Extract the project ID and file name
        const projectId = pathSegments[4];  // `67e68c27f92fc888dee14947`
        const fileName = pathSegments.pop();  // `1743310396179-___Information_Security_Fundamentals___Compliance.pdf`

        if (!projectId || !fileName) {
            console.error('Invalid project ID or file name!');
            alert('Invalid file parameters.');
            return;
        }

        // ✅ Use the correct path for deletion
        const deleteFilePath = `uploads/${projectId}/${fileName}`;
        console.log('🔥 File Path for Deletion:', deleteFilePath);

        const apiUrl = `${API_URL}/project-status/delete-file`;
        
        const response = await axios.delete(apiUrl, {
            headers: { Authorization: `Bearer ${token}` },
            params: { filePath: deleteFilePath, projectId }
        });

        console.log('✅ Delete Response:', response.data);
        alert('File deleted successfully!');

    } catch (error) {
        console.error('❌ Failed to delete file:', error);

        if (error.response) {
            alert(`Failed to delete file: ${error.response.data.message}`);
        } else {
            alert('Failed to delete file. Please try again.');
        }
    }
};
 


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const total = parseFloat(projectStatus.totalAmount);
    const paid = parseFloat(projectStatus.paidAmount);

    if (paid > total) {
      setError('Paid amount cannot exceed total amount.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', projectStatus.name);
      formData.append('status', projectStatus.status);
      formData.append('feedback', projectStatus.feedback);
      formData.append('meetingDate', selectedDate ? selectedDate.toISOString() : '');
      formData.append('totalAmount', projectStatus.totalAmount);
      formData.append('paidAmount', projectStatus.paidAmount);
      formData.append('paymentStatus', projectStatus.paymentStatus);

      quotations.forEach((file) => formData.append('quotations', file));
      images.forEach((file) => formData.append('images', file));

      await axios.post(`${API_URL}/project-status/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Project status updated successfully');
      navigate('/');
    } catch (error) {
      setError('Failed to save project status');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };
 
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger text-center">{error}</p>;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Project Status</h2>
      
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        
        {/* Existing Form Fields */}
        <div className="mb-3">
          <label className="form-label">Name:</label>
          <input
            type="text"
            name="name"
            value={projectStatus.name}
            onChange={handleChange}
            className="form-control"
            disabled
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Status:</label>
          <select
            className="form-select"
            name="status"
            value={projectStatus.status}
            onChange={handleChange}
          >
            <option value="No Status">Select Status</option>
            <option value="Enquiry">Enquiry</option>
            <option value="Design & Quotation">Design & Quotation</option>
            <option value="Order Done">Order Done</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Feedback:</label>
          <textarea
            className="form-control"
            name="feedback"
            value={projectStatus.feedback}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
      <label className="form-label">Meeting Date:</label>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="MM/dd/yyyy"
        className="form-control"
        minDate={new Date()}          // ✅ Prevents past dates
      />
    </div>

 {/* ✅ Conditional rendering for file upload */}
 {projectStatus.status === 'Design & Quotation' && (
          <>
            <div className="mb-3">
              <label className="form-label">Upload Quotations (PDF):</label>
              <input
                type="file"
                multiple
                onChange={(e) => handleFileChange(e, 'quotations')}
                className="form-control"
                accept=".pdf"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Upload Images:</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'images')}
                className="form-control"
              />
            </div>
            
        {/* ✅ File Display Section */}
        <div className="mb-3">
          <h4>Uploaded Files:</h4>

          <div>
            {projectStatus.quotationFiles.map((file, index) => (
              <div key={index}>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  {file.originalName}
                </a>
                <button className="btn btn-danger btn-sm ms-2" onClick={() => handleDeleteFile(file.url, 'quotations')}>
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div>
            {projectStatus.imageFiles.map((file, index) => (
              <div key={index}>
                <img src={file.url} alt="Uploaded" className="img-thumbnail" width="150" />
              </div>
            ))}
          </div>
        </div>
          </>
        )}

         {/* ✅ Conditional Payment Details Section */}
         {projectStatus.status === 'Order Done' && (
          <div className="mb-3">
            <h3>Payment Details</h3>
            
            <label>Total Amount:</label>
            <input type="number" name="totalAmount" value={projectStatus.totalAmount} onChange={handleChange} className="form-control" min="0" />

            <label>Paid Amount:</label>
            <input type="number" name="paidAmount" value={projectStatus.paidAmount} onChange={handleChange} className="form-control" min="0" disabled />
            
            <label>Due Amount:</label>
            <input type="number" name="paidAmount" value={projectStatus.totalAmount- projectStatus.paidAmount} onChange={handleChange} className="form-control" min="0" disabled />

            <label>Payment Status:</label>
            <input type="text" value={projectStatus.paymentStatus} className="form-control" disabled />
 
          </div>
        )} 
        <button className="btn btn-success w-100">Save Changes</button>
      </form> 
      {projectStatus.status === 'Order Done' && (
      <AddPaymentForm
                        projectStatus={projectStatus}
                        setProjectStatus={setProjectStatus}
                         
                    />)}
      <button onClick={handleBack} className="btn btn-secondary mt-3">Back</button>
    </div>
  );
};

export default ProjectStatus;
