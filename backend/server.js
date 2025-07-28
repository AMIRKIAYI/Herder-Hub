require('dotenv').config({ quiet: true });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// After other middleware but before error handlers
const userRoutes = require('./routes/userRoutes');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // This line is crucial

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Atlas connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();


// Basic route for testing
app.get('/', (req, res) => {
  res.send('HerderHub Backend is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected');
});

// Add this before your routes
const jwt = require('jsonwebtoken');

// Test route - Add this with your other routes
app.get('/api/test-token', (req, res) => {
  const testPayload = { userId: 'test', role: 'admin' };
  const token = jwt.sign(testPayload, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN 
  });
  
  res.json({
    token,
    verifyResult: jwt.verify(token, process.env.JWT_SECRET)
  });
});
// backend/server.js
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists (assuming you have a User model)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('⏏️ Mongoose connection closed due to app termination');
  process.exit(0);
});