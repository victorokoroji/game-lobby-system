import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register/Login (since we only need username)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Try to find existing user
    let user = await User.findOne({ username });

    if (user) {
      // User exists, verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      // User doesn't exist, create new user
      user = new User({ username, password });
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        totalWins: user.totalWins,
        totalLosses: user.totalLosses,
        gamesPlayed: user.gamesPlayed,
        winRate: user.winRate
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      totalWins: req.user.totalWins,
      totalLosses: req.user.totalLosses,
      gamesPlayed: req.user.gamesPlayed,
      winRate: req.user.winRate
    }
  });
});

// Refresh token
router.post('/refresh', authenticateToken, (req, res) => {
  const token = generateToken(req.user._id);
  res.json({ token });
});

export default router;
