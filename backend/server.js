require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

// 1. Create the Express App
const app = express();

// 2. Setup Middleware
app.use(cors());
app.use(express.json());

// 3. Define API Routes (NOW you can use 'app')
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/users', require('./routes/users')); // This was the line causing the error

// --- General Routes ---
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));