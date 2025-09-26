// backend/routes/authRoutes.js

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// SAHI TareeKA: getDb ko import karein
import { getDb } from '../db.js';

const router = express.Router();

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Email ya password na hone par error dein
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // SAHI TareeKA: getDb() se connection lein
        const db = getDb();
        const user = await db.collection('users').findOne({ email });

        // Check karein ki user hai aur password match hota hai
        if (user && (await bcrypt.compare(password, user.password))) {
            // JWT token banayein
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '30d',
            });
            
            // Response se password hata dein
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
    
    // Sabhi fields check karein
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const db = getDb();
        const userExists = await db.collection('users').findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Password ko hash (encrypt) karein
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            name,
            email,
            password: hashedPassword,
            role: 'user', // Default role
            cart: [],
            wishlist: [],
            orders: [],
            loyaltyPoints: 0,
            stockNotifications: [],
        };
        
        const result = await db.collection('users').insertOne(newUser);
        
        // Naye user ka data (bina password ke) response mein bhejein
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

export default router;