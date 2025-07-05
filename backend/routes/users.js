import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Update user profile
router.patch('/profile', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName', 'lastName', 'age', 'contactNumber', 'currentPassword', 'newPassword'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Handle password change if requested
    if (req.body.currentPassword && req.body.newPassword) {
      // Compare the provided current password with the stored hash
      const isMatch = await user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Set the new password (it will be automatically hashed by the pre-save middleware)
      user.password = req.body.newPassword;
    } else {
      // Regular profile updates
      ['firstName', 'lastName', 'age', 'contactNumber'].forEach(field => {
        if (req.body[field] !== undefined) {
          user[field] = req.body[field];
        }
      });
    }

    await user.save();
    
    // Don't send password in response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user reviews
router.get('/:id/reviews', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('reviews')
      .populate('reviews.reviewer', 'firstName lastName');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add review for a user
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.reviews.push({
      reviewer: req.user.userId,
      rating,
      comment
    });

    await user.save();
    res.status(201).json(user.reviews[user.reviews.length - 1]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;