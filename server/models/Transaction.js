import mongoose from 'mongoose';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../utils/constants.js';

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true, min: [0.01, 'Amount must be greater than 0'], max: 1e9 },
    category: { type: String, required: true, enum: [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES] },
    date: { type: Date, required: true }, // stored as UTC midnight of the chosen day
    paymentMethod: { type: String, enum: [...PAYMENT_METHODS, ''], default: '' },
    notes: { type: String, trim: true, maxlength: 300, default: '' },
    isDemo: { type: Boolean, default: false }, // true only for rows created by "Load demo data"
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, category: 1 });

transactionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.displayId = `#${String(ret._id).slice(-6).toUpperCase()}`;
    delete ret._id; delete ret.__v; delete ret.userId;
    return ret;
  },
});

export default mongoose.model('Transaction', transactionSchema);
