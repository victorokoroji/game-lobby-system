import GameSession from "../models/GameSession.js";
import User from "../models/User.js";
import { authenticateSocket } from "../middleware/auth.js";

// Store active game timers
const gameTimers = new Map();

export const handleSocketConnection = (socket, io) => {
  console.log("User connected:", socket.id);

  // Authenticate socket connection
  authenticateSocket(socket, (err) => {
    if (err) {
      console.log("Socket authentication failed:", err.message);
      socket.disconnect();
      return;
    }

    console.log("User authenticated:", socket.user.username);

    // Join user to their personal room
    socket.join(`user_${socket.user._id}`);

    // Handle joining game session
    socket.on("join_game", async (data) => {
      try {
        const { selectedNumber } = data;

        if (!selectedNumber || selectedNumber < 1 || selectedNumber > 10) {
          socket.emit("error", {
            message: "Please select a number between 1 and 10",
          });
          return;
        }

        // Find or create active session
        let session = await GameSession.findOne({
          status: { $in: ["waiting", "active"] },
        }).sort({ createdAt: -1 });

        if (!session) {
          session = new GameSession({
            sessionId: `session_${Date.now()}`,
            status: "waiting",
          });
        }

        // Check if user already joined
        const existingPlayerIndex = session.players.findIndex(
          (player) => player.userId.toString() === socket.user._id.toString()
        );

        if (existingPlayerIndex !== -1) {
          // Update their number selection
          session.players[existingPlayerIndex].selectedNumber = selectedNumber;
        } else {
          // Add new player
          if (session.players.length >= session.maxPlayers) {
            socket.emit("error", { message: "Session is full" });
            return;
          }

          session.players.push({
            userId: socket.user._id,
            username: socket.user.username,
            selectedNumber,
          });
        }

        await session.save();

        // Join the game room
        socket.join(`game_${session.sessionId}`);

        // Emit updated session to all connected users (not just game participants)
        io.emit("session_updated", {
          session: session,
          playersCount: session.players.length,
        });

        // Start game if this is the first player and session is waiting
        if (session.status === "waiting" && session.players.length > 0) {
          startGameCountdown(session, io);
        }
      } catch (error) {
        console.error("Error joining game:", error);
        socket.emit("error", { message: "Failed to join game" });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user?.username || socket.id);
    });
  });
};

// Start game countdown
const startGameCountdown = async (session, io) => {
  try {
    // Update session status to active
    session.status = "active";
    session.startTime = new Date();
    await session.save();

    const gameRoom = `game_${session.sessionId}`;
    let timeLeft = session.duration;

    // Clear any existing timer for this session
    if (gameTimers.has(session.sessionId)) {
      clearInterval(gameTimers.get(session.sessionId));
    }

    // Emit game started to all connected users (not just game participants)
    io.emit("game_started", {
      sessionId: session.sessionId,
      duration: session.duration,
      playersCount: session.players.length,
    });

    // Also emit session update so all users know the session is now active
    io.emit("session_updated", {
      session: session,
      playersCount: session.players.length,
    });

    // Start countdown timer
    const timer = setInterval(async () => {
      timeLeft--;

      // Emit countdown update to all connected users
      io.emit("countdown_update", { timeLeft });

      if (timeLeft <= 0) {
        clearInterval(timer);
        gameTimers.delete(session.sessionId);
        await endGame(session, io);
      }
    }, 1000);

    gameTimers.set(session.sessionId, timer);
  } catch (error) {
    console.error("Error starting game countdown:", error);
  }
};

// End game and determine winners
const endGame = async (session, io) => {
  try {
    // Generate winning number (1-10)
    const winningNumber = Math.floor(Math.random() * 10) + 1;

    // Update session
    session.winningNumber = winningNumber;
    session.status = "completed";
    session.endTime = new Date();

    // Determine winners and update player stats
    const winners = [];
    const losers = [];

    for (let player of session.players) {
      if (player.selectedNumber === winningNumber) {
        player.isWinner = true;
        winners.push(player);
      } else {
        losers.push(player);
      }
    }

    await session.save();

    // Update user statistics
    const updatePromises = [];

    // Update winners
    for (let winner of winners) {
      updatePromises.push(
        User.findByIdAndUpdate(winner.userId, {
          $inc: { totalWins: 1, gamesPlayed: 1 },
        })
      );
    }

    // Update losers
    for (let loser of losers) {
      updatePromises.push(
        User.findByIdAndUpdate(loser.userId, {
          $inc: { totalLosses: 1, gamesPlayed: 1 },
        })
      );
    }

    await Promise.all(updatePromises);

    // Emit game results to all connected users
    io.emit("game_ended", {
      sessionId: session.sessionId,
      winningNumber,
      winners: winners.map((w) => w.username),
      totalPlayers: session.players.length,
      winnersCount: winners.length,
    });

    // Schedule next game to start in 10 seconds
    setTimeout(() => {
      io.emit("next_game_starting", {
        message: "New game starting soon!",
        countdown: 10,
      });
    }, 3000);
  } catch (error) {
    console.error("Error ending game:", error);
  }
};
