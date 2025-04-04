import express from 'express';
import mongoose from 'mongoose';
import protect from '../middleware/authMiddleware.js';
import ProjectStatus from '../models/ProjectStatus.js';
import Customer from '../models/Customer.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';  // ✅ Import JWT for token handling

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';  // ✅ Use env secret

// ✅ Ensure `uploads` folder exists
const uploadsDir = path.join('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created "uploads" folder');
}

// ✅ Sanitize filenames
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, '_').substring(0, 100);
};

// ✅ Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const customerDir = path.join('uploads', req.params.id);
    if (!fs.existsSync(customerDir)) {
      fs.mkdirSync(customerDir, { recursive: true });
    }
    cb(null, customerDir);
  },
  filename: (req, file, cb) => {
    const sanitizedFilename = sanitizeFilename(file.originalname);
    cb(null, `${Date.now()}-${sanitizedFilename}`);
  }
});

const upload = multer({ storage });


// ✅ Generate token with expiration time
const generateToken = (id, filename) => {
  return jwt.sign(
    { id, filename },
    JWT_SECRET,
    { expiresIn: '15m' }  // Token expires in 15 mins
  );
};


// ✅ Serve PDF for Preview with Token Validation
router.get('/files/:id/:filename', async (req, res) => {
  const { token } = req.query;  // ✅ Read token from query parameters

  if (!token) {
    return res.status(403).json({ message: 'Token missing' });
  }

  try {
    // ✅ Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    const { id, filename } = decoded;

    const filePath = path.join('uploads', id, filename);

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filename).toLowerCase();

      if (ext === '.pdf') {
        // ✅ Send PDF as preview in the browser
        res.setHeader('Content-Type', 'application/pdf');
        res.sendFile(path.resolve(filePath));
      } else {
        // ✅ Serve images
        res.sendFile(path.resolve(filePath));
      }
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Invalid or expired token:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});


// ✅ GET Project Status with Token in URLs
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const projectStatus = await ProjectStatus.findOne({
      
      user: req.user.id,
      customer: id,
    }).populate('customer');

    if (!projectStatus) {
      return res.json({ message: 'No project status found', projectStatus: null });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}/api/project-status/files`;

    // ✅ Include token in file URLs
    const quotationFiles = projectStatus.quotationFiles?.map(file => {
      const token = generateToken(id, path.basename(file.path));  // ✅ Generate token
      return {
        url: `${baseUrl}/${id}/${path.basename(file.path)}?token=${token}`,  // ✅ Append token to URL
        originalName: file.originalName,
        path: `${id}/${file.originalName}`
      };
    }) || [];

    const imageFiles = projectStatus.imageFiles?.map(file => {
      const token = generateToken(id, path.basename(file.path));  // ✅ Generate token
      return {
        url: `${baseUrl}/${id}/${path.basename(file.path)}?token=${token}`,  // ✅ Append token to URL
        originalName: file.originalName
      };
    }) || [];

    res.json({
      id: projectStatus._id,                   // Include the ID
      customer: projectStatus.customer,        // Include customer reference
      user: projectStatus.user,          
      name: projectStatus.name,
      status: projectStatus.status,
      feedback: projectStatus.feedback,

      // ✅ Payment Fields
      totalAmount: projectStatus.totalAmount || 0,
      paidAmount: projectStatus.paidAmount || 0,
      paymentStatus: projectStatus.paymentStatus || 'Pending',

      quotationFiles,
      imageFiles,
      
      meetingDate: projectStatus.meetingDate
        ? projectStatus.meetingDate.toISOString().split('T')[0]
        : null,
    });

  } catch (err) {
    console.error('GET /project-status/:id - Error:', err.message);
    res.status(500).send('Server error');
  }
});

router.delete('/delete-file', protect, async (req, res) => {
  const { filePath, projectId ,customerId,deleteMongodbPath} = req.query;

  console.log(req.query);
  console.log('🗑️ Deleting File:', filePath);
  console.log('📂 Project ID:', projectId);

  if (!filePath || !projectId) {
      return res.status(400).json({ message: 'Invalid parameters' });
  }
 
  try {
    console.log("Take it",projectId);
    console.log("Customer  ID", customerId);
      const project = await ProjectStatus.findById(projectId);
 
      if (!project) {
          return res.status(404).json({ message: 'Project not found' });
      }

      // ✅ Build the full file path
      const fullFilePath = path.join(process.cwd(), filePath);
      console.log('🛠️ Full file path:', fullFilePath);

      if (fs.existsSync(fullFilePath)) {
          fs.unlinkSync(fullFilePath);
          console.log(`✅ File deleted: ${fullFilePath}`);

          console.log(project);
          // ✅ Remove reference from MongoDB

          //project.quotationFiles = project.quotationFiles.filter(file => file.path !== deleteMongodbPath);
          project.quotationFiles = project.quotationFiles.filter(file => {
            console.log("Backend Checking file:", file.path, "against", deleteMongodbPath); // Log comparison
            return file.path !== deleteMongodbPath;
        });
    
          project.imageFiles = project.imageFiles.filter(file => file.path !== filePath);

          await project.save();

          return res.status(200).json({ message: 'File deleted successfully' });
      } else {
          return res.status(404).json({ message: 'File not found' });
      }

  } catch (error) {
      console.error('❌ Error deleting file:', error);
      return res.status(500).json({ message: 'Failed to delete file' });
  }
});


// ✅ POST payment to project status linked to user and customer
router.post('/:id/payment', protect, async (req, res) => {
  const { id } = req.params;  // ProjectStatus ID
  const { amount, status } = req.body;  // Remove customerId, not required
  const userId = req.user._id;  // Logged-in user ID

  try {
    const project = await ProjectStatus.findOne({
      _id: id,
      user: userId,  // ✅ Ensure it belongs to the user
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or not authorized' });
    }

    // ✅ Add payment entry
    const paymentEntry = {
      date: new Date(),
      amount: parseFloat(amount),
      status: project.paidAmount + parseFloat(amount) >= project.totalAmount ? 'Paid' : 'Partially Paid'
    };

    project.paymentHistory.push(paymentEntry);
    project.paidAmount += parseFloat(amount);

    // ✅ Update payment status
    project.paymentStatus = project.paidAmount >= project.totalAmount ? 'Paid' : 'Partially Paid';

    await project.save();

    res.status(200).json({
      message: 'Payment added successfully',
      paymentHistory: project.paymentHistory,
      paidAmount: project.paidAmount,
      paymentStatus: project.paymentStatus
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
  
// ✅ POST - Upload Files and Save URLs
router.post(
  '/:id',
  protect,
  upload.fields([{ name: 'quotations' }, { name: 'images' }]),
  async (req, res) => {
    const { id } = req.params;
    const { status, feedback, meetingDate, totalAmount, paidAmount } = req.body;

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }

      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      let projectStatus = await ProjectStatus.findOne({
        user: req.user.id,
        customer: id,
      });

      const quotationFiles = req.files['quotations']?.map(file => ({
        path: `${id}/${file.filename}`,
        originalName: file.originalname
      })) || [];

      const imageFiles = req.files['images']?.map(file => ({
        path: `${id}/${file.filename}`,
        originalName: file.originalname
      })) || [];

      // ✅ Calculate Payment Status
      let paymentStatus = 'Pending';
      const total = parseFloat(totalAmount) || 0;
      const paid = parseFloat(paidAmount) || 0;

      if (paid > total) {
        return res.status(400).json({ message: 'Paid amount cannot exceed total amount' });
      }

      if (paid >= total) {
        paymentStatus = 'Completed';
      } else if (paid > 0) {
        paymentStatus = 'Partially Paid';
      }

      if (projectStatus) {
        projectStatus.status = status || projectStatus.status;
        projectStatus.feedback = feedback || projectStatus.feedback;
        projectStatus.meetingDate = meetingDate ? new Date(meetingDate) : projectStatus.meetingDate;

        projectStatus.quotationFiles.push(...quotationFiles);
        projectStatus.imageFiles.push(...imageFiles);

        projectStatus.totalAmount = total;
        projectStatus.paidAmount = paid;
        projectStatus.paymentStatus = paymentStatus;

      } else {
        projectStatus = new ProjectStatus({
          user: req.user.id,
          customer: id,
          name: customer.name,
          status,
          feedback,
          quotationFiles,
          imageFiles,
          meetingDate: meetingDate ? new Date(meetingDate) : null,
          totalAmount: total,
          paidAmount: paid,
          paymentStatus,
        });
      }

      await projectStatus.save();
      res.status(201).json(projectStatus);

    } catch (err) {
      console.error('POST /project-status/:id - Error:', err.message);
      res.status(500).send('Server error');
    }
  }
);

export default router;
