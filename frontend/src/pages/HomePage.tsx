import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

interface LeaderboardEntry {
  rank: number;
  username: string;
  totalWins: number;
  totalLosses: number;
  gamesPlayed: number;
  winRate: number;
}

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentSession, connected, timeLeft } = useSocket();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leaderboard/top-players`);
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleJoinGame = () => {
    navigate('/game');
  };

  const formatTimeLeft = (seconds: number) => {
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Game Lobby</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.username}</span>
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Game Status Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Hi {user?.username}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Total Wins:</span>
                    <span className="text-sm text-gray-900">{user?.totalWins || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Total Losses:</span>
                    <span className="text-sm text-gray-900">{user?.totalLosses || 0}</span>
                  </div>
                </div>

                <div className="mt-6">
                  {currentSession && currentSession.status === 'active' && timeLeft > 0 ? (
                    <div className="text-center">
                      <button
                        onClick={handleJoinGame}
                        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded"
                      >
                        JOIN
                      </button>
                      <p className="text-red-600 text-sm mt-2">
                        there is an active session, you can join in {formatTimeLeft(timeLeft)}
                      </p>
                    </div>
                  ) : currentSession && currentSession.status === 'waiting' ? (
                    <div className="text-center">
                      <button
                        onClick={handleJoinGame}
                        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded"
                      >
                        JOIN
                      </button>
                      <p className="text-green-600 text-sm mt-2">
                        Game session is waiting for players
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <button
                        onClick={handleJoinGame}
                        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded"
                      >
                        JOIN
                      </button>
                      <p className="text-gray-600 text-sm mt-2">
                        {connected ? 'Ready to join a new game' : 'Connecting...'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Leaderboard Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Top Players
                </h3>
                
                {loadingLeaderboard ? (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500">Loading leaderboard...</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.slice(0, 10).map((player) => (
                      <div key={player.rank} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900">
                            #{player.rank}
                          </span>
                          <span className="text-sm text-gray-700">
                            {player.username}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {player.totalWins} wins
                          </div>
                          <div className="text-xs text-gray-500">
                            {player.winRate}% win rate
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
