import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9._%+-]+@.*iiit\.ac\.in$/.test(v);
      },
      message: 'Only IIIT email addresses are allowed'
    }
  },
  age: {
    type: Number,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cart: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],
  reviews: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving (this runs on both new passwords and password updates)
userSchema.pre('save', async function(next) {
  const user = this;
  
  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();
  
  try {
    // Generate a salt with cost factor 10
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the generated salt
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // Compare the candidate password with the stored hash
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

const User = mongoose.model('User', userSchema);
export default User;