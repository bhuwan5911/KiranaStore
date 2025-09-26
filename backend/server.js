import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectToDb } from './db.js';

// Import routes
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
// Explicitly configure CORS to allow all origins, methods, and headers.
// This is crucial for fixing "Failed to fetch" errors in browser environments.
app.use(cors({
  origin: '*', // Allow any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow common methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
}));
app.use(express.json());

app.use((req, res, next) => {
    console.log(`=> REQUEST RECEIVED: ${req.method} ${req.originalUrl}`);
    next();
});

// API Routes
app.get('/', (req, res) => {
    res.send('Kirana ki  Backend API is running...');
});

// Use routers
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    // Establishes initial connection when server starts
    connectToDb();
});
