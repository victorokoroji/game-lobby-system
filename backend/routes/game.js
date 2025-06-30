import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import GameSession from '../models/GameSession.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get current active session
router.get('/current-session', async (req, res) => {
  try {
    const activeSession = await GameSession.findOne({ 
      status: { $in: ['waiting', 'active'] } 
    }).sort({ createdAt: -1 });

    if (!activeSession) {
      return res.json({ session: null });
    }

    res.json({ session: activeSession });
  } catch (error) {
    console.error('Error fetching current session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Join a game session
router.post('/join', authenticateToken, async (req, res) => {
  try {
    const { selectedNumber } = req.body;

    if (!selectedNumber || selectedNumber < 1 || selectedNumber > 10) {
      return res.status(400).json({ error: 'Please select a number between 1 and 10' });
    }

    // Find or create active session
    let session = await GameSession.findOne({ 
      status: { $in: ['waiting', 'active'] } 
    }).sort({ createdAt: -1 });

    if (!session) {
      // Create new session
      session = new GameSession({
        sessionId: uuidv4(),
        status: 'waiting'
      });
    }

    // Check if user already joined this session
    const existingPlayer = session.players.find(
      player => player.userId.toString() === req.user._id.toString()
    );

    if (existingPlayer) {
      // Update their number selection
      existingPlayer.selectedNumber = selectedNumber;
    } else {
      // Add new player
      if (session.players.length >= session.maxPlayers) {
        return res.status(400).json({ error: 'Session is full' });
      }

      session.players.push({
        userId: req.user._id,
        username: req.user.username,
        selectedNumber
      });
    }

    await session.save();

    res.json({ 
      message: 'Successfully joined the game',
      session: session
    });
  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get session by ID
router.get('/session/:sessionId', async (req, res) => {
  try {
    const session = await GameSession.findOne({ 
      sessionId: req.params.sessionId 
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get recent completed sessions
router.get('/recent-sessions', async (req, res) => {
  try {
    const sessions = await GameSession.find({ 
      status: 'completed' 
    })
    .sort({ endTime: -1 })
    .limit(10)
    .select('sessionId winningNumber players endTime winnersCount');

    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching recent sessions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
