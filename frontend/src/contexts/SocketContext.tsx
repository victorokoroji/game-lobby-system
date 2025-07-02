import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface GameSession {
  _id: string;
  sessionId: string;
  status: "waiting" | "active" | "completed";
  players: Array<{
    userId: string;
    username: string;
    selectedNumber?: number;
    isWinner?: boolean;
  }>;
  winningNumber?: number;
  startTime?: string;
  endTime?: string;
  duration: number;
  maxPlayers: number;
  activePlayersCount: number;
}

interface GameResult {
  sessionId: string;
  winningNumber: number;
  winners: string[];
  totalPlayers: number;
  winnersCount: number;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  currentSession: GameSession | null;
  gameResult: GameResult | null;
  timeLeft: number;
  joinGame: (selectedNumber: number) => void;
  clearGameResult: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const SocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(
    null
  );
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const fetchCurrentSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/game/current-session`);
      const data = await response.json();
      if (data.session) {
        setCurrentSession(data.session);
        // If it's an active session, we might need to sync the timer
        if (data.session.status === "active" && data.session.startTime) {
          const startTime = new Date(data.session.startTime).getTime();
          const now = new Date().getTime();
          const elapsed = Math.floor((now - startTime) / 1000);
          const remaining = Math.max(0, data.session.duration - elapsed);
          setTimeLeft(remaining);
        }
      }
    } catch (error) {
      console.error("Error fetching current session:", error);
    }
  };

  useEffect(() => {
    if (token && user) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token,
        },
      });

      newSocket.on("connect", () => {
        console.log("Connected to server");
        setConnected(true);
        // Fetch current session state when connecting
        fetchCurrentSession();
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server");
        setConnected(false);
      });

      newSocket.on("session_updated", (data) => {
        console.log("Session updated:", data.session.status, data.session);
        setCurrentSession(data.session);
      });

      newSocket.on("game_started", (data) => {
        console.log("Game started:", data);
        setTimeLeft(data.duration);
        // Update session status to active when game starts
        setCurrentSession((prev) =>
          prev ? { ...prev, status: "active" } : null
        );
      });

      newSocket.on("countdown_update", (data) => {
        setTimeLeft(data.timeLeft);
      });

      newSocket.on("game_ended", (data: GameResult) => {
        console.log("Game ended:", data);
        setGameResult(data);
        setTimeLeft(0);
        // Update session status to completed when game ends
        setCurrentSession((prev) =>
          prev ? { ...prev, status: "completed" } : null
        );
      });

      newSocket.on("next_game_starting", (data) => {
        console.log("Next game starting:", data);
        // Clear previous game data
        setCurrentSession(null);
        setGameResult(null);
      });

      newSocket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token, user]);

  const joinGame = (selectedNumber: number) => {
    if (socket && connected) {
      socket.emit("join_game", { selectedNumber });
    }
  };

  const clearGameResult = () => {
    setGameResult(null);
  };

  const value: SocketContextType = {
    socket,
    connected,
    currentSession,
    gameResult,
    timeLeft,
    joinGame,
    clearGameResult,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
