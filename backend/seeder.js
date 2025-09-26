// backend/seeder.js

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { products, mockUsers, mockOrders } from './data/mockData.js';
import { connectToDb, getDb } from './db.js';

const importData = async () => {
  try {
    const db = getDb(); // Ab connection pehle hi ho chuka hai

    // Purana data delete karein
    await db.collection('products').deleteMany();
    await db.collection('users').deleteMany();
    await db.collection('orders').deleteMany();

    // Users ke password hash karein
    const createdUsers = mockUsers.map(user => {
        return {
            ...user,
            password: bcrypt.hashSync(user.password || '123456', 10)
        }
    });
    
    // Naya data insert karein
    await db.collection('users').insertMany(createdUsers);
    await db.collection('products').insertMany(products);
    await db.collection('orders').insertMany(mockOrders);

    console.log('✅✅✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error during data import: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    const db = getDb(); // Ab connection pehle hi ho chuka hai
    
    await db.collection('products').deleteMany();
    await db.collection('users').deleteMany();
    await db.collection('orders').deleteMany();

    console.log('🗑️🗑️🗑️ Data Destroyed Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error during data destroy: ${error.message}`);
    process.exit(1);
  }
};

// --- BADLAV START ---
// Ek main function banayein jo pehle connect karega, phir kaam karega
const start = async () => {
    try {
        // Step 1: Database se connect hone ka intezar karein
        await connectToDb();
        console.log("Database connected, proceeding with seeder...");

        // Step 2: Ab check karein ki data import karna hai ya destroy
        if (process.argv[2] === '-d') {
            await destroyData();
        } else {
            await importData();
        }
    } catch (error) {
        console.error("Seeder script failed to start:", error);
        process.exit(1);
    }
};

// Main function ko call karein
start();
// --- BADLAV END ---