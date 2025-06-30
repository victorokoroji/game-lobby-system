# Game Lobby System

A real-time multiplayer number guessing game where players join sessions, pick numbers from 1-10, and compete to win. Built with React, Node.js, MongoDB, and Socket.IO.

## Features

### 🎮 Game Mechanics
- Players join game sessions and select a number from 1-10
- Sessions have a fixed duration (20 seconds by default)
- At the end, a winning number is randomly chosen
- Players who selected the correct number are declared winners
- Real-time countdown timer and player count updates

### 🔐 Authentication
- Simple username/password authentication using JWT
- Automatic account creation for new users
- Secure password hashing with bcrypt

### 📊 Statistics & Leaderboard
- Track wins, losses, and games played for each user
- Top 10 players leaderboard sorted by wins
- Win rate calculations
- Player statistics display

### 🌐 Real-time Features
- WebSocket connections for live game updates
- Real-time player count and countdown timer
- Instant game result notifications
- Automatic session management

## Tech Stack

### Frontend
- **React** with TypeScript
- **TailwindCSS** for styling
- **Socket.IO Client** for real-time communication
- **React Router** for navigation
- **Axios** for HTTP requests

### Backend
- **Node.js** with Express
- **Socket.IO** for WebSocket communication
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** and security middleware

### Infrastructure
- **Docker** containers for all services
- **MongoDB** database
- **Nginx** for frontend serving

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Ports 3000, 5000, and 27017 available

### 1. Clone and Start
```bash
git clone <repository-url>
cd game-lobby-system
docker-compose up --build
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### 3. Create Account & Play
1. Open http://localhost:3000
2. Enter a username (3-20 chars) and password (6+ chars)
3. Click "Sign in / Sign up" - account will be created automatically
4. Click "JOIN" to enter a game session
5. Select a number from 1-10
6. Wait for the countdown and see if you win!

## Development Setup

### Backend Development
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
Make sure MongoDB is running on localhost:27017 or update the connection string in `.env`.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login or create account
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token

### Game
- `GET /api/game/current-session` - Get active game session
- `POST /api/game/join` - Join a game session
- `GET /api/game/session/:id` - Get session details
- `GET /api/game/recent-sessions` - Get recent completed sessions

### Leaderboard
- `GET /api/leaderboard/top-players` - Get top 10 players
- `GET /api/leaderboard/player/:username` - Get player stats

## Socket Events

### Client to Server
- `join_game` - Join game with selected number

### Server to Client
- `session_updated` - Game session state updated
- `game_started` - Game countdown started
- `countdown_update` - Timer update
- `game_ended` - Game finished with results
- `next_game_starting` - New game starting soon

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/game-lobby
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Game Flow

1. **Authentication**: Users log in or create accounts
2. **Home Page**: Shows user stats, leaderboard, and join button
3. **Game Session**: 
   - Players join and select numbers (1-10)
   - 20-second countdown timer
   - Real-time player count updates
4. **Results**: Winners announced, stats updated
5. **Next Round**: New session starts automatically

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
