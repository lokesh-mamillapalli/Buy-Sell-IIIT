import express from 'express';
import auth from '../middleware/auth.js';
import Item from '../models/Item.js';

const router = express.Router();

// Create a new item
router.post('/', auth, async (req, res) => {
  try {
    const item = new Item({
      ...req.body,
      seller: req.user.userId
    });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all items
router.get('/', auth, async (req, res) => {
  try {
    const { search, categories } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (categories) {
      const categoryList = categories.split(',');
      query.category = { $in: categoryList };
    }

    const items = await Item.find(query)
      .populate('seller', 'firstName lastName email')
      .populate({
        path: 'reviews.reviewer',
        select: 'firstName lastName email'
      });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific item
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('seller', 'firstName lastName email')
      .populate({
        path: 'reviews.reviewer',
        select: 'firstName lastName email'
      });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a review to an item
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if user has already reviewed this item
    const existingReview = item.reviews.find(
      review => review.reviewer.toString() === req.user.userId
    );

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this item' });
    }

    item.reviews.push({
      reviewer: req.user.userId,
      rating,
      comment
    });

    await item.save();
    
    const populatedItem = await Item.findById(item._id)
      .populate('seller', 'firstName lastName email')
      .populate({
        path: 'reviews.reviewer',
        select: 'firstName lastName email'
      });

    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update an item
router.patch('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, seller: req.user.userId });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    Object.keys(req.body).forEach(key => {
      item[key] = req.body[key];
    });

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, seller: req.user.userId });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;