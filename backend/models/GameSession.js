import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed'],
    default: 'waiting'
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    selectedNumber: {
      type: Number,
      min: 1,
      max: 10
    },
    isWinner: {
      type: Boolean,
      default: false
    }
  }],
  winningNumber: {
    type: Number,
    min: 1,
    max: 10
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in seconds
    default: 20
  },
  maxPlayers: {
    type: Number,
    default: 50
  }
}, {
  timestamps: true
});

// Index for efficient queries
gameSessionSchema.index({ status: 1, createdAt: -1 });
gameSessionSchema.index({ sessionId: 1 });

// Virtual for active players count
gameSessionSchema.virtual('activePlayersCount').get(function() {
  return this.players.length;
});

// Virtual for winners count
gameSessionSchema.virtual('winnersCount').get(function() {
  return this.players.filter(player => player.isWinner).length;
});

// Ensure virtual fields are serialized
gameSessionSchema.set('toJSON', { virtuals: true });

export default mongoose.model('GameSession', gameSessionSchema);
