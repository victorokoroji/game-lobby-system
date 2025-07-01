import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Import routes
import authRoutes from "./routes/auth.js";
import gameRoutes from "./routes/game.js";
import leaderboardRoutes from "./routes/leaderboard.js";

// Import socket handlers
import { handleSocketConnection } from "./socket/socketHandlers.js";

dotenv.config();

const app = express();
const server = createServer(app);
// CORS configuration - allow multiple origins
const allowedOrigins = [
  process.env.CORS_ORIGIN || "http://localhost:3000",
  "http://localhost:5173", // Vite dev server
  "http://localhost:3000", // Frontend container
  "http://localhost:5000", // Direct API access
  "https://game-lobby-frontend.onrender.com", // Render Deployment
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(morgan("combined"));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log("Origin allowed:", origin);
        callback(null, true);
      } else {
        console.log("Origin blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Connect to MongoDB with retry logic
const connectToMongoDB = async () => {
  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds

  for (let i = 0; i < maxRetries; i++) {
    try {
      await mongoose.connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/game-lobby",
        {
          serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
          socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        }
      );
      console.log("Connected to MongoDB");
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, err.message);
      if (i === maxRetries - 1) {
        console.error("Failed to connect to MongoDB after maximum retries");
        process.exit(1);
      }
      console.log(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};

connectToMongoDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// Health check
app.get("/api/health", (req, res) => {
  const mongoStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    mongodb: mongoStatus,
  });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  handleSocketConnection(socket, io);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
