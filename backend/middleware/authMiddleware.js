import jwt from 'jsonwebtoken';
import { connectToDb } from '../db.js';
import { ObjectId } from 'mongodb';

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            const db = await connectToDb();
            req.user = await db.collection('users').findOne({ _id: new ObjectId(decoded.id) }, { projection: { password: 0 } });
            
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.user.id = req.user._id.toString(); // Add string id for convenience

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
