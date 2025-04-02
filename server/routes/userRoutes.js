// server/routes/userRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
  
    try {
      console.log("Register User working");
  
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
      console.log("Register1",req.body);
      user = new User({
        name,
        email,
        password,
        role,
      });
  
      await user.save();
  
      // Create and assign token
      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };
          console.log("Register2",process.env.JWT_SECRET );
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
            console.log("Register3",token );
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists (case-insensitive)
    let user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password (using the method in User model)
    const isMatch = await user.matchPassword(password); // Use the method on the user object

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and assign token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Server error');
        }
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/me
// @desc    Get user data
// @access  Private
// router.get('/me', protect, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     res.json(user);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });
// @route   GET api/users/me
// @desc    Get user data
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
      console.log('GET /api/users/me - User ID from token:', req.user.id); // Log user ID
  
      const user = await User.findById(req.user.id).select('-password');
  
      if (!user) {
        console.log('GET /api/users/me - User not found in database');
        return res.status(404).json({ message: 'User not found' }); // More specific error
      }
  
      console.log('GET /api/users/me - User data:', user);
      res.json(user);
  
    } catch (err) {
      console.error('GET /api/users/me - Server error:', err.message);
      res.status(500).send('Server error');
    }
  });

export default router;