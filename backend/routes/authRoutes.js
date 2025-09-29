// backend/routes/authRoutes.js

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // Token generate karne ke liye
import nodemailer from 'nodemailer'; // Email bhejne ke liye
import { getDb } from '../db.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const db = getDb();
        const user = await db.collection('users').findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '30d',
            });
            
            const { password, ...userWithoutPassword } = user;

            res.json({
                ...userWithoutPassword,
                token,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const db = getDb();
        const userExists = await db.collection('users').findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            name,
            email,
            password: hashedPassword,
            role: 'user',
            cart: [],
            wishlist: [],
            orders: [],
            loyaltyPoints: 0,
            stockNotifications: [],
        };
        
        const result = await db.collection('users').insertOne(newUser);
        
        const createdUser = await db.collection('users').findOne({ _id: result.insertedId });
        
        if (createdUser) {
            const { password, ...userWithoutPassword } = createdUser;
            res.status(201).json(userWithoutPassword);
        } else {
            throw new Error('User not created');
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});


// --- BADLAV START: FORGOT PASSWORD ROUTES ---

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const db = getDb();
        const user = await db.collection('users').findOne({ email });

        if (!user) {
            // Security ke liye, hum yeh nahi batate ki email exist karta hai ya nahi
            return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
        }

        // Reset token banayein
        const resetToken = crypto.randomBytes(20).toString('hex');
        const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { passwordResetToken, passwordResetExpires } }
        );

        // Frontend ka URL
        const resetUrl = `http://localhost:3000/#/reset-password/${resetToken}`;
        
        // Nodemailer setup
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // Ya koi aur service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            to: user.email,
            from: `Shophub <${process.env.EMAIL_USER}>`,
            subject: 'Shophub Password Reset Request',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                   Please click on the following link, or paste this into your browser to complete the process:\n\n
                   ${resetUrl}\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        // Email bhejein
        await transporter.sendMail(mailOptions);
        
        console.log(`Password reset link for ${user.email}: ${resetUrl}`); // Development ke liye link console mein dikhayein

        res.status(200).json({ message: 'Password reset link sent to your email.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending password reset email' });
    }
});


// @desc    Reset password with token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
router.put('/reset-password/:token', async (req, res) => {
    try {
        const db = getDb();
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        // Token se user dhoondein aur check karein ki token expire to nahi hua
        const user = await db.collection('users').findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        // Naya password set karein
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        await db.collection('users').updateOne(
            { _id: user._id },
            { $set: {
                password: hashedPassword,
                passwordResetToken: undefined,
                passwordResetExpires: undefined,
            }}
        );
        
        res.status(200).json({ message: 'Password has been reset successfully.' });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// --- BADLAV END ---

export default router;