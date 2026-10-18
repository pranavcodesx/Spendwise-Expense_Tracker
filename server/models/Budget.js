import mongoose from 'mongoose';
import { EXPENSE_CATEGORIES } from '../utils/constants.js';

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true, enum: EXPENSE_CATEGORIES },
    month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ }, // "2026-10"
    limitAmount: { type: Number, required: true, min: [0.01, 'Limit must be greater than 0'], max: 1e9 },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One budget per user + month + category.
budgetSchema.index({ userId: 1, month: 1, category: 1 }, { unique: true });

budgetSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id; delete ret.__v; delete ret.userId;
    return ret;
  },
});

export default mongoose.model('Budget', budgetSchema);
