import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectToDb } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
// ✅ FIX 1: Naye paymentRoutes ko import karein
import paymentRoutes from './routes/paymentRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use((req, res, next) => {
    console.log(`=> REQUEST RECEIVED: ${req.method} ${req.originalUrl}`);
    next();
});

// API Routes
app.get('/', (req, res) => {
    res.send('Kirana ki Backend API is running...');
});

// Use routers
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
// ✅ FIX 2: Naye payment routes ko use karein
app.use('/api/payment', paymentRoutes);


// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    connectToDb();
});

