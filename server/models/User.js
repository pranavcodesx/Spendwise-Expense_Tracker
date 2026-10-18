import mongoose from 'mongoose';
import { CURRENCIES } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 },
    passwordHash: { type: String, required: true, select: false },
    currency: { type: String, enum: CURRENCIES, default: 'INR' },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// The only shape of a user that ever leaves the server.
userSchema.methods.toPublic = function toPublic() {
  return { id: this._id, name: this.name, email: this.email, currency: this.currency, createdAt: this.createdAt };
};

export default mongoose.model('User', userSchema);
