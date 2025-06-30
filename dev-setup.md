# Development Setup Guide

## Prerequisites

1. **Node.js** (v20 or higher)
2. **MongoDB** (running on localhost:27017)
3. **Git**

## Quick Start

### 1. Install Dependencies

```bash
# Root dependencies (for concurrent development)
npm install

# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Environment Setup

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Edit .env with your settings
```

**Frontend (.env):**
```bash
cd frontend
cp .env.example .env
# Edit .env with your settings
```

### 3. Start MongoDB

Make sure MongoDB is running on localhost:27017. You can:
- Install MongoDB locally
- Use Docker: `docker run -d -p 27017:27017 mongo:7.0`
- Use MongoDB Atlas (cloud)

### 4. Start Development Servers

**Option 1: Start both servers concurrently (recommended)**
```bash
npm run dev
```

**Option 2: Start servers separately**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Docker Development (Alternative)

If you prefer using Docker for development:

```bash
# Start all services
docker-compose up --build

# Access at:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: localhost:27017
```

## Testing the Application

1. **Create Account**: Go to http://localhost:5173, enter username/password
2. **Join Game**: Click "JOIN" button on home page
3. **Play Game**: Select a number 1-10, wait for countdown
4. **View Results**: See if you won and check updated stats
5. **Leaderboard**: View top players on home page

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify .env file exists and has correct MongoDB URI
- Check if port 5000 is available

### Frontend won't start
- Check if backend is running on port 5000
- Verify .env file has correct API URLs
- Check if port 5173 is available

### Socket connection issues
- Ensure backend is running
- Check CORS settings in backend
- Verify socket URL in frontend .env

### Database connection errors
- Confirm MongoDB is running
- Check MongoDB URI in backend .env
- Ensure database permissions are correct