import express from 'express';
import { getDb } from '../db.js';
import { ObjectId } from 'mongodb';
import { protect, admin } from '../middleware/authMiddleware.js';
import multer from 'multer';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import path from 'path';

const router = express.Router();

// --- Multer Configuration ---

// Configuration for saving IMAGE files to disk
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // Save images here
    },
    filename: function (req, file, cb) {
        // Create a unique filename to prevent overwriting
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configuration for saving CSV files in memory
const csvStorage = multer.memoryStorage();

// Middleware for handling image uploads
const uploadImage = multer({ storage: imageStorage });

// Middleware for handling CSV uploads
const uploadCsv = multer({ storage: csvStorage });


// --- Image Upload Route ---
router.post('/upload', protect, admin, uploadImage.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded.' });
    }
    // Return the public URL of the uploaded file
    const imageUrl = `/uploads/${req.file.filename}`; // Relative URL is better
    res.status(200).json({ imageUrl: imageUrl });
});


// --- Product Management ---

router.post('/products', protect, admin, async (req, res) => {
    const { name, category, price, stock, description, imageUrl, relatedImages } = req.body;
    try {
        const db = getDb();
        const lastProduct = await db.collection('products').find().sort({ id: -1 }).limit(1).toArray();
        const nextId = (lastProduct[0]?.id || 0) + 1;
        const newProduct = {
            id: nextId, name, category, 
            price: Number(price), stock: Number(stock),
            description, imageUrl, relatedImages: relatedImages || [],
            rating: 0, reviews: 0,
        };
        await db.collection('products').insertOne(newProduct);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Failed to add product', error: error.message });
    }
});

router.post('/products/bulk', protect, admin, uploadCsv.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No CSV file uploaded.' });
    }
    const productsToAdd = [];
    const db = getDb();
    const lastProduct = await db.collection('products').find().sort({ id: -1 }).limit(1).toArray();
    let nextId = (lastProduct[0]?.id || 0) + 1;
    const readableStream = Readable.from(req.file.buffer.toString('utf-8'));
    readableStream.pipe(csvParser({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
        .on('data', (row) => {
            const newProduct = {
                id: nextId++, name: row.name, category: row.category,
                price: Number(row.price) || 0, stock: Number(row.stock) || 0,
                description: row.description, imageUrl: row.imageurl || row.image,
                relatedImages: row.relatedimages ? row.relatedimages.split(',').map(url => url.trim()) : [],
                rating: 0, reviews: 0,
            };
            if (newProduct.name && newProduct.category && newProduct.price > 0 && newProduct.imageUrl) {
                 productsToAdd.push(newProduct);
            }
        })
        .on('end', async () => {
            if (productsToAdd.length === 0) {
                return res.status(400).json({ message: 'CSV file is empty or contains no valid products.' });
            }
            try {
                await db.collection('products').insertMany(productsToAdd);
                res.status(201).json({ message: `${productsToAdd.length} products added successfully!` });
            } catch (error) {
                res.status(500).json({ message: 'Error inserting products into database.', error: error.message });
            }
        });
});

router.put('/products/stock', protect, admin, async (req, res) => {
    const { productIds, value, operation } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0 || typeof value !== 'number' || !['set', 'add'].includes(operation)) {
        return res.status(400).json({ message: 'Invalid input data.' });
    }
    if (operation === 'set' && value < 0) {
        return res.status(400).json({ message: 'Stock value cannot be negative when setting.' });
    }
    try {
        const db = getDb();
        let updateQuery = operation === 'set' ? { $set: { stock: value } } : { $inc: { stock: value } };
        const result = await db.collection('products').updateMany({ id: { $in: productIds } }, updateQuery);
        res.json({ message: `${result.modifiedCount} products' stock updated successfully.` });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product stock', error: error.message });
    }
});

router.put('/products/:id', protect, admin, async (req, res) => {
    const productId = Number(req.params.id);
    const { name, category, price, stock, description, imageUrl, relatedImages } = req.body;
    try {
        const db = getDb();
        const result = await db.collection('products').findOneAndUpdate(
            { id: productId },
            { $set: { name, category, price: Number(price), stock: Number(stock), description, imageUrl, relatedImages } },
            { returnDocument: 'after' }
        );
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error: error.message });
    }
});

router.delete('/products/:id', protect, admin, async (req, res) => {
    const productId = Number(req.params.id);
    try {
        const db = getDb();
        const result = await db.collection('products').deleteOne({ id: productId });
        if (result.deletedCount === 1) {
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

// --- Order Management ---
router.get('/orders', protect, admin, async (req, res) => {
    try {
        const db = getDb();
        const orders = await db.collection('orders').find({}).sort({ date: -1 }).toArray();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

router.put('/orders/:id/status', protect, admin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const db = getDb();
        const result = await db.collection('orders').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { status } },
            { returnDocument: 'after' }
        );
         if (result) {
            res.json(result);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error updating order status', error: error.message });
    }
});

// --- User Management ---
router.get('/users', protect, admin, async (req, res) => {
    try {
        const db = getDb();
        const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

export default router;

