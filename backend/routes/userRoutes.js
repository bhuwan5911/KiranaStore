// backend/routes/userRoutes.js - UPDATED

import express from 'express';
import { getDb } from '../db.js';
import { protect } from '../middleware/authMiddleware.js';
import { ObjectId } from 'mongodb';
//  FIX 1: Naye email function ko import karein
import { sendOrderConfirmationEmail } from '../utils/sendOrderConfirmationEmail.js';

const router = express.Router();

// --- Cart Routes ---
router.get('/cart', protect, (req, res) => {
    try {
        const cartItems = req.user.cart || [];
        res.json(cartItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error: error.message });
    }
});
router.post('/cart', protect, async (req, res) => {
    const productId = Number(req.body.productId);
    const quantity = Number(req.body.quantity) || 1;
    try {
        const db = getDb();
        const product = await db.collection('products').findOne({ id: productId });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        const cart = req.user.cart || [];
        const existingItemIndex = cart.findIndex(item => item.id === productId);
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }
        await db.collection('users').updateOne({ _id: new ObjectId(req.user._id) }, { $set: { cart } });
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error adding to cart', error: error.message });
    }
});
router.delete('/cart/:productId', protect, async (req, res) => {
    const productId = Number(req.params.productId);
    try {
        const db = getDb();
        const currentCart = req.user.cart || [];
        const newCart = currentCart.filter(item => item.id !== productId);
        await db.collection('users').updateOne({ _id: new ObjectId(req.user._id) }, { $set: { cart: newCart } });
        res.json(newCart);
    } catch (error) {
        res.status(500).json({ message: 'Error removing from cart', error: error.message });
    }
});
router.put('/cart', protect, async (req, res) => {
    const { productId, quantity } = req.body;
    if (typeof productId !== 'number' || typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid product ID or quantity' });
    }
    try {
        const db = getDb();
        const cart = req.user.cart || [];
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity = quantity;
        } else {
            return res.status(404).json({ message: 'Item not in cart' });
        }
        await db.collection('users').updateOne({ _id: new ObjectId(req.user._id) }, { $set: { cart } });
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error updating cart', error: error.message });
    }
});


// --- Wishlist, Orders, Profile Routes ---

router.get('/wishlist', protect, async (req, res) => {
    try {
        const db = getDb();
        const wishlistIds = req.user.wishlist || [];
        const wishlistItems = await db.collection('products').find({ id: { $in: wishlistIds } }).toArray();
        res.json(wishlistItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
    }
});

// ✅ FIX 2: '/orders' route ko update kiya gaya hai
router.post('/orders', protect, async (req, res) => {
    const { cart } = req.body;
    try {
        const db = getDb();
        const productIds = cart.map(item => item.id);
        const productsInDb = await db.collection('products').find({ id: { $in: productIds } }).toArray();

        let totalAmount = 0;
        for (const item of cart) {
            const product = productsInDb.find(p => p.id === item.id);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ message: `Item ${item.name} is out of stock.` });
            }
            totalAmount += product.price * item.quantity;
        }

        const newOrder = {
            userId: new ObjectId(req.user._id),
            userName: req.user.name,
            date: new Date().toISOString(),
            items: cart,
            totalAmount: totalAmount,
            status: 'Pending',
        };

        const result = await db.collection('orders').insertOne(newOrder);
        // Poora order object lein, jismein MongoDB se mili _id bhi ho
        const savedOrder = { ...newOrder, _id: result.insertedId };
        
        await db.collection('users').updateOne({ _id: new ObjectId(req.user._id) }, { $set: { cart: [] } });

        // Order save hone ke baad, email bhejein
        try {
            await sendOrderConfirmationEmail(req.user.email, req.user.name, savedOrder);
        } catch (emailError) {
            // Agar email fail ho, toh bas console mein error log karein,
            // process ko rokein nahi. Customer ko order confirmation milna chahiye.
            console.error("Failed to send order confirmation email:", emailError);
        }

        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Failed to place order', error: error.message });
    }
});

router.get('/orders', protect, async (req, res) => {
    try {
        const db = getDb();
        const userOrders = await db.collection('orders').find({ userId: new ObjectId(req.user._id) }).sort({ date: -1 }).toArray();
        res.json(userOrders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
});

// GET USER PROFILE
router.get('/profile', protect, (req, res) => {
    res.json(req.user);
});

// ✅ FIX: REWRITTEN THIS ROUTE TO BE MORE EFFICIENT AND PREVENT HANGING
router.put('/profile', protect, async (req, res) => {
    try {
        const db = getDb();
        const userId = new ObjectId(req.user._id);

        // Prepare the fields to be updated from the request body
        const updatedFields = {};
        if (req.body.name) updatedFields.name = req.body.name;
        if (req.body.phone) updatedFields.phone = req.body.phone;
        if (req.body.address) updatedFields.address = req.body.address;
        if (req.body.loyaltyPoints !== undefined) updatedFields.loyaltyPoints = req.body.loyaltyPoints;
        if (req.body.stockNotifications) updatedFields.stockNotifications = req.body.stockNotifications;

        // Use findOneAndUpdate to update the user and get the new document in a single atomic operation
        const result = await db.collection('users').findOneAndUpdate(
            { _id: userId },
            { $set: updatedFields },
            { 
                returnDocument: 'after', // This option returns the document *after* the update
                projection: { password: 0 } // We don't want to send the password back
            }
        );
        
        if (result) {
            res.json(result); // Send the updated user back
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

export default router;

