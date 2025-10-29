const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorMiddleware');
const accountRoutes = require('./routes/accountRoutes');
const listingRoutes = require('./routes/listingRoutes');
const userRoutes = require('./routes/userRoutes');
const connectRoutes = require('./routes/connects');
const transactionRoutes = require('./routes/transactionRoutes'); // Add this line
const mpesaRoutes = require('./routes/mpesaRoutes');
const emailRoutes = require('./routes/emailRoutes');
const smsRoutes = require("./routes/sms");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

const allowedOrigins = ['http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connects', connectRoutes);
app.use('/api/transactions', transactionRoutes); // Add this line
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/sms', smsRoutes);


// Error Middleware
app.use(errorHandler);

// MongoDB & Server Start
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });