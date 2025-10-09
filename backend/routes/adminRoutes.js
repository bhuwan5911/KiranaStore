import express from 'express';
import { getDb } from '../db.js';
import { ObjectId } from 'mongodb';
import { protect, admin } from '../middleware/authMiddleware.js';

// ✅ FIX 1: Nayi libraries ko import karein
import multer from 'multer';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

const router = express.Router();

// ✅ FIX 2: Multer ko file upload ke liye setup karein
// Yeh file ko memory mein store karega, disk par nahi
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// --- Product Management ---

// Middleware har route par alag se lagaya gaya hai
router.post('/products', protect, admin, async (req, res) => {
    // ... (existing code is fine)
});

// ✅ FIX 3: NAYA ROUTE - BULK PRODUCT UPLOAD KE LIYE
router.post('/products/bulk', protect, admin, upload.single('file'), async (req, res) => {
    // 'file' wahi naam hai jo frontend se aa raha hai
    if (!req.file) {
        return res.status(400).json({ message: 'No CSV file uploaded.' });
    }

    const productsToAdd = [];
    const db = getDb();
    
    // Get the highest current product ID to continue incrementing from there
    const lastProduct = await db.collection('products').find().sort({ id: -1 }).limit(1).toArray();
    let nextId = (lastProduct[0]?.id || 0) + 1;

    // File buffer ko stream mein convert karein taaki csv-parser use padh sake
    const readableStream = Readable.from(req.file.buffer.toString('utf-8'));

    readableStream
        .pipe(csvParser())
        .on('data', (row) => {
            // Har row ko format karein
            const newProduct = {
                id: nextId++,
                name: row.name,
                category: row.category,
                price: Number(row.price) || 0,
                stock: Number(row.stock) || 0,
                description: row.description,
                imageUrl: row.imageUrl,
                relatedImages: row.relatedImages ? row.relatedImages.split(',').map(url => url.trim()) : [],
                rating: 0,
                reviews: 0,
            };
            // Validation: Ensure essential fields are not empty
            if (newProduct.name && newProduct.category && newProduct.price > 0 && newProduct.imageUrl) {
                 productsToAdd.push(newProduct);
            } else {
                console.warn('Skipping invalid row:', row);
            }
        })
        .on('end', async () => {
            if (productsToAdd.length === 0) {
                return res.status(400).json({ message: 'CSV file is empty or contains no valid products.' });
            }
            try {
                // Sabhi valid products ko database mein ek saath insert karein
                await db.collection('products').insertMany(productsToAdd);
                res.status(201).json({ message: `${productsToAdd.length} products added successfully!` });
            } catch (error) {
                res.status(500).json({ message: 'Error inserting products into database.', error: error.message });
            }
        })
        .on('error', (error) => {
            res.status(500).json({ message: 'Error parsing CSV file.', error: error.message });
        });
});


router.put('/products/stock', protect, admin, async (req, res) => {
    // ... (existing code is fine)
});

router.put('/products/:id', protect, admin, async (req, res) => {
    // ... (existing code is fine)
});

router.delete('/products/:id', protect, admin, async (req, res) => {
    // ... (existing code is fine)
});

// --- Order Management ---
router.get('/orders', protect, admin, async (req, res) => {
    // ... (existing code is fine)
});

router.put('/orders/:id/status', protect, admin, async (req, res) => {
    // ... (existing code is fine)
});

// --- User Management ---
router.get('/users', protect, admin, async (req, res) => {
    // ... (existing code is fine)
});

export default router;

