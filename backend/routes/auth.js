import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();

// Verify reCAPTCHA token
async function verifyRecaptcha(token) {
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token
        }
      }
    );
    return response.data.success;
  } catch (error) {
    return false;
  }
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, age, contactNumber, password, captchaToken } = req.body;

    if (!captchaToken || !(await verifyRecaptcha(captchaToken))) {
      return res.status(400).json({ error: 'Invalid CAPTCHA' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      age,
      contactNumber,
      password
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;

    if (!captchaToken || !(await verifyRecaptcha(captchaToken))) {
      return res.status(400).json({ error: 'Invalid CAPTCHA' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// CAS Login
router.get('/cas', (req, res) => {
  const casUrl = 'https://login.iiit.ac.in/cas';
  const serviceUrl = 'https://ims.iiit.ac.in/do.php?OGWXFw9QCTnZWlS+dQMxZhRre3rPbXUZ8cyb99+zWGQQ35WQv+uVWG/jdegLRKeYNTXFw291qaIcmTcx9B9QuQ==';
  res.redirect(`${casUrl}/login?service=${encodeURIComponent(serviceUrl)}`);
});

// CAS Callback
router.get('/cas/callback', async (req, res) => {
  try {
    const ticket = req.query.ticket;
    if (!ticket) {
      return res.redirect('/login?error=cas_failed');
    }

    const casUrl = 'https://login.iiit.ac.in/cas';
    const serviceUrl = 'https://ims.iiit.ac.in/do.php?OGWXFw9QCTnZWlS+dQMxZhRre3rPbXUZ8cyb99+zWGQQ35WQv+uVWG/jdegLRKeYNTXFw291qaIcmTcx9B9QuQ==';
    const validateUrl = `${casUrl}/serviceValidate?ticket=${ticket}&service=${encodeURIComponent(serviceUrl)}`;

    const response = await axios.get(validateUrl);
    const username = extractUsernameFromCasResponse(response.data);

    if (!username) {
      return res.redirect('/login?error=cas_validation_failed');
    }

    let user = await User.findOne({ email: `${username}@iiit.ac.in` });
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        email: `${username}@iiit.ac.in`,
        firstName: username,
        lastName: '',
        age: 20,
        contactNumber: '',
        password: crypto.randomBytes(20).toString('hex')
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.redirect(`/login/success?token=${token}`);
  } catch (error) {
    console.error('CAS Error:', error);
    res.redirect('/login?error=cas_error');
  }
});


function extractUsernameFromCasResponse(xmlResponse) {
  // Implementation depends on CAS response format
  // This is a placeholder - you'll need to parse the XML response
  return null;
}

export default router;