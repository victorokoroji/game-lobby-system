import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/game.js';
import leaderboardRoutes from './routes/leaderboard.js';

// Import socket handlers
import { handleSocketConnection } from './socket/socketHandlers.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/game-lobby')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  handleSocketConnection(socket, io);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
