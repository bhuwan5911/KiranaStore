import { MongoClient } from 'mongodb';
import 'dotenv/config';

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in the .env file. Please create a backend/.env file.');
}

let db;

async function connectToDb() {
    if (db) return db;

    try {
        const client = new MongoClient(mongoUri);
        await client.connect();
        console.log('Connected successfully to MongoDB Atlas');
        db = client.db('kirana-store'); // You can name your database here
        return db;
    } catch (e) {
        console.error("Could not connect to MongoDB Atlas", e);
        process.exit(1);
    }
}

export { connectToDb };
