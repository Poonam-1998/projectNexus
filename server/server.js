// server/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import userRoutes from './routes/userRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import projectStatusRoutes from './routes/projectStatusRoutes.js';
//import paymentRoutes from './routes/paymentRoutes.js';
import customerTypeRoutes from './routes/customerTypeRoutes.js';  
import projectDateHistoryRoutes from './routes/projectDateHistoryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

import fs from 'fs';
import path from 'path'; 

dotenv.config();

const app = express();

// ✅ Ensure `uploads` folder exists
const uploadsDir = path.join('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created "uploads" folder');
}

connectDB();

app.use(cors());
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ✅ Use the correct `/api` route prefix
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/project-status', projectStatusRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/customertypes', customerTypeRoutes);  // ✅ Add route
app.use('/api/projectHistory-status',projectDateHistoryRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
