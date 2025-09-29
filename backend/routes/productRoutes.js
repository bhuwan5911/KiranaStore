import express from 'express';
import { getDb } from '../db.js';
import { protect } from '../middleware/authMiddleware.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// @desc    Get all products or products by category
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
    const { category } = req.query;
    try {
        const db = getDb();
        let query = {};
        if (category && category !== 'all') {
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
    try {
        const db = getDb();
        const productId = Number(req.params.id);
        const product = await db.collection('products').findOne({ id: productId });

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching product' });
    }
});

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
router.get('/:id/reviews', async (req, res) => {
    const productId = Number(req.params.id);
    try {
        const db = getDb();
        const reviews = await db.collection('reviews').find({ product_id: productId }).sort({ date: -1 }).toArray();
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
});

// @desc    Add a review for a product
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
    const productId = Number(req.params.id);
    const { rating, comment } = req.body;
    
    try {
        const db = getDb();
        
        const newReview = {
            product_id: productId,
            user_id: new ObjectId(req.user._id),
            author: req.user.name,
            rating: Number(rating),
            comment,
            date: new Date().toISOString(),
        };

        const result = await db.collection('reviews').insertOne(newReview);
        const createdReview = await db.collection('reviews').findOne({ _id: result.insertedId });
        
        // Product ki average rating aur review count update karein
        const allReviews = await db.collection('reviews').find({ product_id: productId }).toArray();
        const totalReviews = allReviews.length;
        const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / totalReviews;

        await db.collection('products').updateOne(
            { id: productId },
            { $set: { reviews: totalReviews, rating: parseFloat(avgRating.toFixed(1)) } }
        );
        
        res.status(201).json(createdReview);
    } catch (error) {
        res.status(400).json({ message: 'Error submitting review', error: error.message });
    }
});
// @desc    Delete a review
// @route   DELETE /api/products/:productId/reviews/:reviewId
// @access  Private
router.delete('/:productId/reviews/:reviewId', protect, async (req, res) => {
    try {
        const db = getDb();
        const reviewId = new ObjectId(req.params.reviewId);
        
        // Check karein ki review मौजूद hai aur use delete karne wala user uska owner hai
        const review = await db.collection('reviews').findOne({ _id: reviewId });

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user_id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized to delete this review' });
        }

        await db.collection('reviews').deleteOne({ _id: reviewId });
        
        // Product ki rating dobara calculate karein
        const productId = Number(req.params.productId);
        const allReviews = await db.collection('reviews').find({ product_id: productId }).toArray();
        const totalReviews = allReviews.length;
        const avgRating = totalReviews > 0 
            ? allReviews.reduce((acc, item) => item.rating + acc, 0) / totalReviews 
            : 0;

        await db.collection('products').updateOne(
            { id: productId },
            { $set: { reviews: totalReviews, rating: parseFloat(avgRating.toFixed(1)) } }
        );

        res.json({ message: 'Review removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
// @desc    Update a review
// @route   PUT /api/products/:productId/reviews/:reviewId
// @access  Private
router.put('/:productId/reviews/:reviewId', protect, async (req, res) => {
    const { rating, comment } = req.body;
    try {
        const db = getDb();
        const reviewId = new ObjectId(req.params.reviewId);
        
        const review = await db.collection('reviews').findOne({ _id: reviewId });

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.user_id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedReview = await db.collection('reviews').findOneAndUpdate(
            { _id: reviewId },
            { $set: { 
                rating: Number(rating), 
                comment: comment,
                date: new Date().toISOString() 
            }},
            { returnDocument: 'after' }
        );

        // Product ki rating dobara calculate karein
        const productId = Number(req.params.productId);
        const allReviews = await db.collection('reviews').find({ product_id: productId }).toArray();
        const totalReviews = allReviews.length;
        const avgRating = totalReviews > 0 
            ? allReviews.reduce((acc, item) => item.rating + acc, 0) / totalReviews 
            : 0;

        await db.collection('products').updateOne(
            { id: productId },
            { $set: { reviews: totalReviews, rating: parseFloat(avgRating.toFixed(1)) } }
        );
        
        res.json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;


