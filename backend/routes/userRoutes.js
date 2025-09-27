import express from 'express';
import { getDb } from '../db.js';
import { protect } from '../middleware/authMiddleware.js';
import { ObjectId } from 'mongodb';

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
        if (!product) {
            return res.status(404).json({ message: 'Product not found in DB' });
        }
        
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

// NAYA ROUTE YAHAN ADD KIYA GAYA HAI
router.put('/cart', protect, async (req, res) => {
    const { productId, quantity } = req.body;

    if (typeof productId !== 'number' || typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid product ID or quantity' });
    }

    try {
        const db = getDb();
        const product = await db.collection('products').findOne({ id: productId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (quantity > product.stock) {
            return res.status(400).json({ message: 'Not enough stock' });
        }

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

router.post('/orders', protect, async (req, res) => {
    const { cart, shippingAddress } = req.body; // Shipping address bhi lenge
    try {
        const db = getDb();
        const productIds = cart.map(item => item.id);
        const productsInDb = await db.collection('products').find({ id: { $in: productIds } }).toArray();

        // Stock aur total amount dobara check karein
        let totalAmount = 0;
        for (const item of cart) {
            const product = productsInDb.find(p => p.id === item.id);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ message: `Item ${item.name} is out of stock.` });
            }
            totalAmount += product.price * item.quantity;
        }

        const newOrder = {
            // MongoDB apne aap _id generate karega
            userId: new ObjectId(req.user._id),
            userName: req.user.name,
            shippingAddress,
            date: new Date().toISOString(),
            items: cart,
            totalAmount: totalAmount,
            status: 'Pending',
        };

        await db.collection('orders').insertOne(newOrder);

        // User ka cart khaali karein
        await db.collection('users').updateOne({ _id: new ObjectId(req.user._id) }, { $set: { cart: [] } });

        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: 'Failed to place order', error: error.message });
    }
});

router.get('/profile', protect, (req, res) => {
    res.json(req.user);
});


export default router;