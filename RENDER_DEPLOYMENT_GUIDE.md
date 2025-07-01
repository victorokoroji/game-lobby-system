# Render Deployment Guide for Game Lobby System

This guide will walk you through deploying your Game Lobby System to Render.

## Prerequisites

1. **GitHub Repository**: Your code must be in a GitHub repository
2. **MongoDB Atlas Account**: For production database (free tier available)
3. **Render Account**: Sign up at [render.com](https://render.com)

## Step 1: Set Up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Create a database user:
   - Go to Database Access → Add New Database User
   - Choose "Password" authentication
   - Create username/password (save these!)
   - Grant "Read and write to any database" role
4. Set up network access:
   - Go to Network Access → Add IP Address
   - Choose "Allow access from anywhere" (0.0.0.0/0)
5. Get your connection string:
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/game-lobby`)

## Step 2: Push Code to GitHub

Make sure your code is pushed to a GitHub repository with all the files we've created:
- `render.yaml` (deployment configuration)
- Updated `frontend/vite.config.ts`
- Environment example files

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

## Step 3: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Click "Apply" to create both services

### Option B: Manual Service Creation

If you prefer to create services manually:

#### Backend Service:
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `game-lobby-backend`
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

#### Frontend Service:
1. Click "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `game-lobby-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

## Step 4: Configure Environment Variables

### Backend Environment Variables:
Go to your backend service settings and add:

- `NODE_ENV`: `production`
- `PORT`: `10000` (Render sets this automatically)
- `MONGODB_URI`: Your MongoDB Atlas connection string from Step 1
- `JWT_SECRET`: Generate a secure random string (32+ characters)
- `CORS_ORIGIN`: Your frontend URL (will be provided after frontend deploys)

### Frontend Environment Variables:
Go to your frontend service settings and add:

- `VITE_API_URL`: Your backend URL + `/api` (e.g., `https://your-backend.onrender.com/api`)
- `VITE_SOCKET_URL`: Your backend URL (e.g., `https://your-backend.onrender.com`)

## Step 5: Update CORS Settings

After both services are deployed:

1. Get your frontend URL from Render dashboard
2. Update the backend's `CORS_ORIGIN` environment variable with your frontend URL
3. Redeploy the backend service

## Step 6: Test Your Deployment

1. Visit your frontend URL
2. Create an account and test the game functionality
3. Check the Render logs if you encounter any issues

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `CORS_ORIGIN` in backend matches your frontend URL exactly
2. **Database Connection**: Verify MongoDB Atlas connection string and network access
3. **Build Failures**: Check the build logs in Render dashboard
4. **Socket.IO Issues**: Ensure `VITE_SOCKET_URL` points to your backend URL

### Checking Logs:
- Go to your service in Render dashboard
- Click on "Logs" tab to see real-time logs
- Look for error messages and connection issues

## Production Considerations

1. **Database Backups**: Set up automated backups in MongoDB Atlas
2. **Monitoring**: Use Render's built-in monitoring or add external monitoring
3. **Custom Domain**: You can add a custom domain in Render settings
4. **SSL**: Render provides SSL certificates automatically
5. **Scaling**: Consider upgrading to paid plans for better performance

## Environment Variables Reference

### Backend (.env):
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/game-lobby
JWT_SECRET=your-super-secure-jwt-secret-key-32-chars-minimum
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

### Frontend (.env):
```
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_SOCKET_URL=https://your-backend-url.onrender.com
```

## Next Steps

After successful deployment:
1. Test all game functionality
2. Monitor performance and logs
3. Consider setting up automated deployments
4. Add monitoring and error tracking
5. Set up database backups and monitoring

Your Game Lobby System should now be live and accessible to users worldwide!
