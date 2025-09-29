// backend/seeder.js

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { products, mockUsers, mockOrders } from './data/mockData.js';
import { connectToDb, getDb } from './db.js';

const importData = async () => {
  try {
    const db = getDb();

    // Purana data delete karein
    await db.collection('products').deleteMany();
    await db.collection('users').deleteMany();
    await db.collection('orders').deleteMany();

    // --- BADLAV START ---
    // Step A: Normal users ko mockData se banayein (agar koi hai)
    const createdUsers = mockUsers.map(user => {
        return {
            ...user,
            password: bcrypt.hashSync(user.password || '123456', 10)
        }
    });
    
    // Step B: Admin user ko .env file se banayein
    const adminUser = {
        name: 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
        role: 'admin',
        address: 'Store HQ',
        phone: '0000000000',
        cart: [],
        wishlist: [],
        orders: [],
        loyaltyPoints: 0,
        stockNotifications: [],
    };

    // Step C: Dono tarah ke users ko database mein daalein
    if (createdUsers.length > 0) {
        await db.collection('users').insertMany(createdUsers);
    }
    await db.collection('users').insertOne(adminUser);
    // --- BADLAV END ---

    // Baaki ka data insert karein
    await db.collection('products').insertMany(products);
    
    // Optional: Agar aap mock orders bhi daalna chahte hain
    if (mockOrders.length > 0) {
        await db.collection('orders').insertMany(mockOrders);
    }

    console.log('✅✅✅ Data with Secure Admin Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error during data import: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    const db = getDb();
    
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

const start = async () => {
    try {
        await connectToDb();
        console.log("Database connected, proceeding with seeder...");

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

start();