import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <SocketProvider>
                    <HomePage />
                  </SocketProvider>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/game" 
              element={
                <ProtectedRoute>
                  <SocketProvider>
                    <GamePage />
                  </SocketProvider>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
