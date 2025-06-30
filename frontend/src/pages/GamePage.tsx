import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const GamePage: React.FC = () => {
  const { user } = useAuth();
  const { currentSession, gameResult, timeLeft, joinGame, clearGameResult, connected } = useSocket();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already joined the current session
    if (currentSession && user) {
      const userInSession = currentSession.players.find(
        player => player.userId === user.id
      );
      if (userInSession) {
        setHasJoined(true);
        setSelectedNumber(userInSession.selectedNumber || null);
      }
    }
  }, [currentSession, user]);

  const handleNumberSelect = (number: number) => {
    if (currentSession?.status === 'active' && timeLeft <= 0) {
      return; // Game has ended
    }
    
    setSelectedNumber(number);
    joinGame(number);
    setHasJoined(true);
  };

  const handleBackToHome = () => {
    clearGameResult();
    navigate('/');
  };

  const renderGameResult = () => {
    if (!gameResult || !user) return null;

    const isWinner = gameResult.winners.includes(user.username);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            
            <div className="mb-6">
              <div className="text-6xl font-bold text-gray-800 mb-2">
                {gameResult.winningNumber}
              </div>
              <div className="text-sm text-gray-600">Winning Number</div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="text-sm">
                <span className="font-medium">Total players:</span> {gameResult.totalPlayers}
              </div>
              <div className="text-sm">
                <span className="font-medium">Total wins:</span> {gameResult.winnersCount}
              </div>
            </div>

            <div className={`p-4 rounded-lg mb-6 ${isWinner ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-bold text-lg">
                {isWinner ? '🎉 You Won!' : '😔 You Lost'}
              </div>
              <div className="text-sm mt-1">
                You selected: {selectedNumber}
              </div>
            </div>

            {gameResult.winners.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Winners:</h3>
                <div className="bg-gray-50 rounded p-3">
                  {gameResult.winners.map((winner, index) => (
                    <div key={index} className="text-sm text-green-600 font-medium">
                      {winner}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 mb-4">
              New session starts in 10-8 seconds...
            </div>

            <button
              onClick={handleBackToHome}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      <div className="bg-gray-300 rounded-lg p-8 max-w-md w-full mx-4 relative">
        
        {/* Countdown Timer */}
        <div className="absolute top-4 right-4">
          <div className="text-right">
            <div className="text-xs text-gray-600">Countdown timer</div>
            <div className="text-4xl font-bold text-gray-800">
              {timeLeft > 0 ? timeLeft : '0'}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <h1 className="text-xl font-medium text-gray-800 mb-8">
            Pick a random number from 1 - 10
          </h1>

          {/* Number Selection */}
          <div className="mb-8">
            <input
              type="number"
              min="1"
              max="10"
              value={selectedNumber || ''}
              onChange={(e) => {
                const num = parseInt(e.target.value);
                if (num >= 1 && num <= 10) {
                  handleNumberSelect(num);
                }
              }}
              className="w-full p-4 text-center text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              placeholder="Enter 1-10"
              disabled={currentSession?.status === 'active' && timeLeft <= 0}
            />
          </div>

          {/* Number Buttons */}
          <div className="grid grid-cols-5 gap-2 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
              <button
                key={number}
                onClick={() => handleNumberSelect(number)}
                disabled={currentSession?.status === 'active' && timeLeft <= 0}
                className={`p-3 rounded-lg font-medium transition-colors ${
                  selectedNumber === number
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {number}
              </button>
            ))}
          </div>

          {/* Game Status */}
          <div className="text-center">
            {currentSession ? (
              <div className="text-green-600 text-sm">
                {currentSession.activePlayersCount} users joined
              </div>
            ) : (
              <div className="text-gray-600 text-sm">
                {connected ? 'Waiting for game session...' : 'Connecting...'}
              </div>
            )}
          </div>

          {/* Back Button */}
          <button
            onClick={handleBackToHome}
            className="mt-6 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Game Result Modal */}
      {renderGameResult()}
    </div>
  );
};

export default GamePage;
