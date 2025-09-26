import express from 'express';
// --- BADLAV START ---
// connectToDb ki jagah getDb ko import karein
import { getDb } from '../db.js';
// protect middleware ko import karein private routes ke liye
import { protect } from '../middleware/authMiddleware.js';
import { ObjectId } from 'mongodb';
// --- BADLAV END ---

const router = express.Router();

// @desc    Get all products or products by category
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
    const { category } = req.query;
    try {
        // --- BADLAV START ---
        // Pehle se bane hue connection ko getDb() se lein
        const db = getDb();
        // --- BADLAV END ---
        let query = {};
        if (category && category !== 'all') { // 'all' category ke liye filter na karein
            query = { category: category };
        }
        const products = await db.collection('products').find(query).toArray();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    const productId = Number(req.params.id);
    try {
        // --- BADLAV START ---
        const db = getDb();
        // --- BADLAV END ---
        const product = await db.collection('products').findOne({ id: productId });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
router.get('/:id/reviews', async (req, res) => {
    const productId = Number(req.params.id);
    try {
        // --- BADLAV START ---
        const db = getDb();
        // --- BADLAV END ---
        const reviews = await db.collection('reviews').find({ product_id: productId }).toArray();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
});

// @desc    Add a review for a product
// @route   POST /api/products/:id/reviews
// @access  Private
// --- BADLAV START ---
// protect middleware add kiya gaya hai
router.post('/:id/reviews', protect, async (req, res) => {
// --- BADLAV END ---
    const productId = Number(req.params.id);
    const { rating, comment } = req.body; // author ko req.user se lenge
    try {
        const db = getDb();
        
        // Manual check ki ab zaroorat nahi, protect middleware handle karega
        // if (!req.user) { ... }
        
        const newReview = {
            product_id: productId,
            user_id: new ObjectId(req.user._id), // user_id ko ObjectId olarak save karein
            author: req.user.name, // Logged-in user ka naam use karein
            rating: Number(rating),
            comment,
            date: new Date().toISOString(),
        };

        const result = await db.collection('reviews').insertOne(newReview);
        
        // Product ki average rating update karein
        const reviewsForProduct = await db.collection('reviews').find({ product_id: productId }).toArray();
        const totalReviews = reviewsForProduct.length;
        const totalRating = reviewsForProduct.reduce((acc, item) => item.rating + acc, 0);
        const newAverageRating = totalRating / totalReviews;

        await db.collection('products').updateOne(
            { id: productId },
            { $set: { reviews: totalReviews, rating: parseFloat(newAverageRating.toFixed(1)) } }
        );
        
        res.status(201).json({ ...newReview, _id: result.insertedId });
    } catch (error) {
        res.status(400).json({ message: 'Error submitting review', error: error.message });
    }
});

export default router;