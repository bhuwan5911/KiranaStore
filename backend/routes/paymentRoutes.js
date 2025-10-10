import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
// ✅ FIX: Is line ko sabse upar add karein taaki .env file load ho sake
import 'dotenv/config';
import { protect } from '../middleware/authMiddleware.js';
import { getDb } from '../db.js';
import { ObjectId } from 'mongodb';
import { sendOrderConfirmationEmail } from '../utils/sendOrderConfirmationEmail.js';

const router = express.Router();

// Yeh ab kaam karega kyunki 'dotenv/config' ne variables load kar diye hain
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ROUTE 1: Create a Razorpay Order
router.post('/orders', protect, async (req, res) => {
    try {
        const { amount } = req.body;
        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `receipt_order_${new Date().getTime()}`,
        };
        const order = await razorpay.orders.create(options);
        if (!order) return res.status(500).send('Error creating order');
        res.json(order);
    } catch (error) {
        console.error('Error in Razorpay order creation:', error);
        res.status(500).send('An error occurred while creating the order');
    }
});

// ROUTE 2: Verify Payment & Create Order in DB
router.post('/verify', protect, async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            cart,
            shippingAddress 
        } = req.body;
        
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ message: 'Invalid signature sent!' });
        }

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
            userEmail: req.user.email,
            userPhone: req.user.phone,
            shippingAddress: shippingAddress,
            date: new Date().toISOString(),
            items: cart,
            totalAmount: totalAmount,
            status: 'Processing',
            paymentDetails: {
                razorpay_order_id,
                razorpay_payment_id,
                method: 'Online (Razorpay)'
            }
        };

        const result = await db.collection('orders').insertOne(newOrder);
        const savedOrder = { ...newOrder, _id: result.insertedId };
        
        await db.collection('users').updateOne({ _id: new ObjectId(req.user._id) }, { $set: { cart: [] } });

        try {
            await sendOrderConfirmationEmail(req.user.email, req.user.name, savedOrder);
        } catch (emailError) {
            console.error("Failed to send order confirmation email after payment:", emailError);
        }
        
        res.status(200).json({ 
            message: 'Payment verified successfully and order created!',
            orderId: savedOrder._id 
        });

    } catch (error) {
        console.error('Error in payment verification:', error);
        res.status(500).send('An error occurred during payment verification');
    }
});

export default router;

