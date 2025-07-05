import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Item from '../models/Item.js';

const router = express.Router();

// Add item to cart
router.post('/:itemId', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.seller.toString() === req.user.userId) {
      return res.status(400).json({ error: 'Cannot add your own item to cart' });
    }

    const user = await User.findById(req.user.userId);
    if (user.cart.includes(req.params.itemId)) {
      return res.status(409).json({ error: 'Item already in cart' });
    }

    user.cart.push(req.params.itemId);
    await user.save();
    
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cart items
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: 'cart',
      populate: { path: 'seller', select: 'firstName lastName email' }
    });
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from cart
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.cart = user.cart.filter(item => item.toString() !== req.params.itemId);
    await user.save();
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
router.delete('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.cart = [];
    await user.save();
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;