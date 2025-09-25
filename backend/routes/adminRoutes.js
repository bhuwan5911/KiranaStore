import express from 'express';
import { connectToDb } from '../db.js';
import { ObjectId } from 'mongodb';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes in this file for admin access
router.use(protect, admin);

// --- Product Management ---

// @desc    Create a product
// @route   POST /api/admin/products
// @access  Private/Admin
router.post('/products', async (req, res) => {
    const { name, category, price, stock, description, imageUrl, relatedImages } = req.body;
    try {
        const db = await connectToDb();
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
            // In a real app, IDs should be handled more robustly
            id: (await db.collection('products').countDocuments()) + 1, 
        };
        const result = await db.collection('products').insertOne(newProduct);
        const createdProduct = await db.collection('products').findOne({ _id: result.insertedId });
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error creating product', error: error.message });
    }
});

// @desc    Bulk create products from CSV/JSON
// @route   POST /api/admin/products/bulk
// @access  Private/Admin
router.post('/products/bulk', async (req, res) => {
    const productsToUpload = req.body; // Expecting an array of product objects

    if (!Array.isArray(productsToUpload) || productsToUpload.length === 0) {
        return res.status(400).json({ message: 'Invalid input: Expected an array of products.' });
    }

    try {
        const db = await connectToDb();
        const productsCollection = db.collection('products');

        // Find the highest existing 'id' to ensure uniqueness
        const lastProduct = await productsCollection.find().sort({ id: -1 }).limit(1).toArray();
        let nextId = lastProduct.length > 0 ? lastProduct[0].id + 1 : 1;

        const newProducts = productsToUpload.map(p => ({
            ...p,
            id: nextId++,
            price: Number(p.price) || 0,
            stock: Number(p.stock) || 0,
            rating: 0,
            reviews: 0,
            relatedImages: p.relatedImages || []
        }));

        const result = await productsCollection.insertMany(newProducts);
        
        res.status(201).json({ 
            message: `Successfully added ${result.insertedCount} products.`,
            insertedCount: result.insertedCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during bulk product upload', error: error.message });
    }
});


// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
router.put('/products/:id', async (req, res) => {
    const productId = Number(req.params.id);
    const { name, category, price, stock, description, imageUrl, relatedImages } = req.body;
    try {
        const db = await connectToDb();
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

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
router.delete('/products/:id', async (req, res) => {
    const productId = Number(req.params.id);
    try {
        const db = await connectToDb();
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

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get('/orders', async (req, res) => {
    try {
        const db = await connectToDb();
        const orders = await db.collection('orders').find({}).sort({ date: -1 }).toArray();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
router.put('/orders/:id/status', async (req, res) => {
    const orderId = Number(req.params.id);
    const { status } = req.body;
    try {
        const db = await connectToDb();
        const result = await db.collection('orders').findOneAndUpdate(
            { id: orderId },
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

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
    try {
        const db = await connectToDb();
        const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

export default router;
