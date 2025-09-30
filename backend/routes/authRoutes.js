// backend/routes/authRoutes.js

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
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


// --- FORGOT PASSWORD ROUTES ---

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const db = getDb();
        const user = await db.collection('users').findOne({ email });

        if (!user) {
            return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { passwordResetToken, passwordResetExpires } }
        );

        const resetUrl = `http://localhost:3000/#/reset-password/${resetToken}`;
        
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // --- BADLAV START: Sundar HTML Email Template ---
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #FFA500; padding: 20px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px;">Shophub Password Reset</h1>
                </div>
                <div style="padding: 30px;">
                    <h2 style="font-size: 20px; color: #333;">Hello, ${user.name}!</h2>
                    <p>We received a request to reset the password for your account.</p>
                    <p>To reset your password, click the button below. This link will expire in <strong>10 minutes</strong>.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #2D3436; color: white; padding: 15px 25px; text-decoration: none; border-radius: 50px; font-size: 16px; font-weight: bold;">Reset Your Password</a>
                    </div>
                    <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #999;">If you're having trouble clicking the button, copy and paste this URL into your web browser: ${resetUrl}</p>
                </div>
                <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #999;">
                    &copy; 2025 Shophub. All Rights Reserved.
                </div>
            </div>
        `;
        // --- BADLAV END ---

        const mailOptions = {
            to: user.email,
            from: `Shophub <${process.env.EMAIL_USER}>`,
            subject: 'Shophub Password Reset Request',
            html: emailHtml, // Plain text ki jagah HTML use karein
        };

        await transporter.sendMail(mailOptions);
        
        console.log(`Password reset link for ${user.email}: ${resetUrl}`);

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

        const user = await db.collection('users').findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

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


export default router;