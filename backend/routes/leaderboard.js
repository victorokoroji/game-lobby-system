import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get top 10 players by wins
router.get('/top-players', async (req, res) => {
  try {
    const topPlayers = await User.find({ gamesPlayed: { $gt: 0 } })
      .sort({ totalWins: -1, totalLosses: 1 })
      .limit(10)
      .select('username totalWins totalLosses gamesPlayed');

    const leaderboard = topPlayers.map((player, index) => ({
      rank: index + 1,
      username: player.username,
      totalWins: player.totalWins,
      totalLosses: player.totalLosses,
      gamesPlayed: player.gamesPlayed,
      winRate: player.gamesPlayed > 0 ? Math.round((player.totalWins / player.gamesPlayed) * 100) : 0
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get player stats
router.get('/player/:username', async (req, res) => {
  try {
    const player = await User.findOne({ 
      username: req.params.username 
    }).select('username totalWins totalLosses gamesPlayed createdAt');

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Get player's rank
    const playersWithMoreWins = await User.countDocuments({
      totalWins: { $gt: player.totalWins },
      gamesPlayed: { $gt: 0 }
    });

    const rank = playersWithMoreWins + 1;

    res.json({
      player: {
        username: player.username,
        totalWins: player.totalWins,
        totalLosses: player.totalLosses,
        gamesPlayed: player.gamesPlayed,
        winRate: player.gamesPlayed > 0 ? Math.round((player.totalWins / player.gamesPlayed) * 100) : 0,
        rank,
        memberSince: player.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
