// backend/db.js

import { MongoClient } from 'mongodb';

// --- BADLAV START ---
// Ek variable banayein jo database instance ko store karega
let dbInstance;
// --- BADLAV END ---

const connectToDb = async () => {
    // Agar pehle se connected hai, to dobara connect na karein
    if (dbInstance) {
        return;
    }
    try {
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        
        // --- BADLAV START ---
        // Connection ko dbInstance variable mein store karein
        // Note: 'kirana-store' ko apne database ke naam se badlein agar alag hai
        dbInstance = client.db('kirana-store'); 
        // --- BADLAV END ---
        
        console.log('Connected successfully to MongoDB Atlas');
    } catch (error) {
        console.error('Could not connect to MongoDB Atlas', error);
        process.exit(1);
    }
};

// --- BADLAV START ---
// Ek naya function banayein jo store kiye gaye connection ko return karega
const getDb = () => {
    if (!dbInstance) {
        throw new Error('Database not connected. Call connectToDb first.');
    }
    return dbInstance;
};

// Dono functions ko export karein
export { connectToDb, getDb };
// --- BADLAV END ---