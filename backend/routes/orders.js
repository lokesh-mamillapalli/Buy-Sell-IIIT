import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import auth from '../middleware/auth.js';
import Order from '../models/Order.js';
import OrderHistory from '../models/OrderHistory.js';
import User from '../models/User.js';
import Item from '../models/Item.js';

const router = express.Router();

// Place order
router.post('/', auth, async (req, res) => {
  try {
    const buyer = await User.findById(req.user.userId).populate('cart');
    if (buyer.cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const orders = [];
    for (const item of buyer.cart) {
      const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      const order = new Order({
        transactionId: crypto.randomBytes(16).toString('hex'),
        buyer: buyer._id,
        seller: item.seller,
        item: item._id,
        amount: item.price,
        otp: plainOtp,
        status: 'pending'
      });

      await order.save();
      orders.push({ order, plainOtp });
    }

    buyer.cart = [];
    await buyer.save();

    res.status(201).json(orders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Complete order with OTP
router.post('/:orderId/complete', auth, async (req, res) => {
  try {
    const { otp } = req.body;
    const order = await Order.findOne({ 
      _id: req.params.orderId, 
      seller: req.user.userId,
      status: 'pending'
    }).populate('item');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const isValidOtp = await bcrypt.compare(otp, order.otp);
    if (!isValidOtp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Create order history entry
    const orderHistory = new OrderHistory({
      buyer: order.buyer,
      seller: order.seller,
      item: order.item._id,
      amount: order.amount,
      transactionId: order.transactionId,
      status: 'completed'
    });
    await orderHistory.save();

    // Update order status
    order.status = 'completed';
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending deliveries (for seller)
router.get('/pending-deliveries', auth, async (req, res) => {
  try {
    const orders = await Order.find({ 
      seller: req.user.userId,
      status: 'pending'
    })
    .populate('item')
    .populate('buyer', 'firstName lastName email')
    .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get buyer's orders
router.get('/buyer', auth, async (req, res) => {
  try {
    // Get current pending orders
    const pendingOrders = await Order.find({ 
      buyer: req.user.userId,
      status: 'pending'
    })
    .populate('item')
    .populate('seller', 'firstName lastName email');

    // Get completed orders from history
    const completedOrders = await OrderHistory.find({
      buyer: req.user.userId,
      status: 'completed'
    })
    .populate('item')
    .populate('seller', 'firstName lastName email');

    // Combine and sort by date
    const allOrders = [...pendingOrders, ...completedOrders].sort((a, b) => 
      b.createdAt - a.createdAt
    );

    res.json(allOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get seller's orders
router.get('/seller', auth, async (req, res) => {
  try {
    // Get current pending orders
    const pendingOrders = await Order.find({ 
      seller: req.user.userId 
    })
    .populate('item')
    .populate('buyer', 'firstName lastName email');

    // Get completed orders from history
    const completedOrders = await OrderHistory.find({
      seller: req.user.userId
    })
    .populate('item')
    .populate('buyer', 'firstName lastName email');

    // Combine and sort by date, ensuring unique orders
    const allOrders = [...pendingOrders, ...completedOrders];
    const uniqueOrders = Array.from(new Set(allOrders.map(order => order.transactionId)))
      .map(transactionId => allOrders.find(order => order.transactionId === transactionId))
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json(uniqueOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Regenerate OTP
router.post('/:orderId/regenerate-otp', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.orderId,
      buyer: req.user.userId,
      status: 'pending'
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(plainOtp, salt);
    
    order.otp = hashedOtp;
    await order.save();

    res.json({ order, plainOtp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;