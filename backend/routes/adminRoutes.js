import express from 'express';
import { getDb } from '../db.js';
import { ObjectId } from 'mongodb';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ FIX: Global middleware ko yahan se hata diya gaya hai
// router.use(protect, admin); // <-- REMOVED THIS LINE

// --- Product Management ---

// ✅ FIX: Middleware har route par alag se lagaya gaya hai
router.post('/products', protect, admin, async (req, res) => {
    const { name, category, price, stock, description, imageUrl, relatedImages } = req.body;
    try {
        const db = getDb();
        const newProduct = {
            name, category, price: Number(price), stock: Number(stock),
            description, imageUrl, relatedImages: relatedImages || [],
            rating: 0, reviews: 0,
            id: (await db.collection('products').countDocuments()) + 1, 
        };
        const result = await db.collection('products').insertOne(newProduct);
        const createdProduct = await db.collection('products').findOne({ _id: result.insertedId });
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error creating product', error: error.message });
    }
});

// ✅ FIX: Middleware har route par alag se lagaya gaya hai
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
        console.error("Bulk stock update error:", error);
        res.status(500).json({ message: 'Error updating product stock', error: error.message });
    }
});

// ✅ FIX: Middleware har route par alag se lagaya gaya hai
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

// ✅ FIX: Middleware har route par alag se lagaya gaya hai
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

// ✅ FIX: Middleware har route par alag se lagaya gaya hai
router.get('/orders', protect, admin, async (req, res) => {
    try {
        const db = getDb();
        const orders = await db.collection('orders').find({}).sort({ date: -1 }).toArray();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

// ✅ FIX: Middleware har route par alag se lagaya gaya hai
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

// ✅ FIX: Middleware har route par alag se lagaya gaya hai
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

