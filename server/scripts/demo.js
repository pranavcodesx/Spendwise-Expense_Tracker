// Usage:  npm run demo:load -- you@example.com     |     npm run demo:clear -- you@example.com
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import { clearDemoData, createDemoData } from '../services/demoData.js';

const [action, email] = process.argv.slice(2);
if (!['load', 'clear'].includes(action) || !email) {
  console.log('Usage: node scripts/demo.js <load|clear> <user-email>');
  process.exit(1);
}
await connectDB();
const user = await User.findOne({ email: email.toLowerCase() });
if (!user) console.error(`No user found with email ${email}. Sign up in the app first.`);
else console.log(action === 'load' ? await createDemoData(user._id) : await clearDemoData(user._id));
await mongoose.disconnect();
