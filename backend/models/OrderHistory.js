import mongoose from 'mongoose';

const orderHistorySchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'completed'
  }
}, {
  timestamps: true
});

const OrderHistory = mongoose.model('OrderHistory', orderHistorySchema);
export default OrderHistory;