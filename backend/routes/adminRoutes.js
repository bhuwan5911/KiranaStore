import express from 'express';
// --- BADLAV: connectToDb ki jagah getDb ko import karein ---
import { getDb } from '../db.js';
import { ObjectId } from 'mongodb';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Sabhi routes ko protect karein
router.use(protect, admin);

// --- Product Management ---

router.post('/products', async (req, res) => {
    const { name, category, price, stock, description, imageUrl, relatedImages } = req.body;
    try {
        // --- BADLAV: getDb() ka istemal karein ---
        const db = getDb();
        const newProduct = {
            name,
            category,
            price: Number(price),
            stock: Number(stock),
            description,
            imageUrl,
            relatedImages: relatedImages || [],
            rating: 0,
            reviews: 0,
            id: (await db.collection('products').countDocuments()) + 1, 
        };
        const result = await db.collection('products').insertOne(newProduct);
        const createdProduct = await db.collection('products').findOne({ _id: result.insertedId });
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error creating product', error: error.message });
    }
});

// Baaki sabhi functions mein bhi `connectToDb` ko `getDb` se replace kar diya gaya hai...
// (Neeche poora code theek karke diya gaya hai)

router.put('/products/:id', async (req, res) => {
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

router.delete('/products/:id', async (req, res) => {
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

router.get('/orders', async (req, res) => {
    try {
        const db = getDb();
        const orders = await db.collection('orders').find({}).sort({ date: -1 }).toArray();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

router.put('/orders/:id/status', async (req, res) => {
    // Note: MongoDB _id is a string, not a number
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

router.get('/users', async (req, res) => {
    try {
        const db = getDb();
        const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

export default router;
