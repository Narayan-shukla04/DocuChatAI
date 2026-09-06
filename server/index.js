require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], methods: ['GET', 'POST', 'DELETE', 'PUT'], credentials: true }));
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { message: 'Too many requests, try again after 15 minutes' } }));
app.use('/api/docs/upload', rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { message: 'Upload limit exceeded. Try again after an hour.' } }));

void connectDB();

app.use('/api/docs', require('./routes/document'));
app.use('/api/chat', require('./routes/chat'));
app.get('/', (_, res) => res.send('DocuChat AI API is running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
