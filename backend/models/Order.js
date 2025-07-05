import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const orderSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Hash OTP before saving
orderSchema.pre('save', async function(next) {
  if (this.isModified('otp') && !this.otp.startsWith('$2')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.otp = await bcrypt.hash(this.otp, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;