// backend/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
// BADLAV: Sirf 'getDb' ko import karein
import { getDb } from '../db.js';
import { ObjectId } from 'mongodb';

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // BADLAV: connectToDb() ki jagah getDb() use karein
            const db = getDb();
            
            req.user = await db.collection('users').findOne({ _id: new ObjectId(decoded.id) }, { projection: { password: 0 } });
            
            if (!req.user) {
               return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

export { protect, admin };