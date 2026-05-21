require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(express.json());

// Strict CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  credentials: true
}));

app.use(helmet());
app.use(morgan('dev'));

// Rate Limiting
const rateLimit = require('express-rate-limit');

// Global Limiter: Max 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Upload Limiter: Max 10 uploads per hour
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Upload limit exceeded. Please try again after an hour.' }
});

app.use('/api/', globalLimiter);
app.use('/api/docs/upload', uploadLimiter);

// Connect to DB
connectDB();

// Routes
app.use('/api/docs', require('./routes/document'));
app.use('/api/chat', require('./routes/chat'));

app.get('/', (req, res) => {
  res.send('DocuChat AI API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
