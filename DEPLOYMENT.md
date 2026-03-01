# Deployment Guide

## Prerequisites
- MongoDB Atlas account (free tier)
- Render.com account (for backend)
- Vercel account (for frontend)

## Step 1: Setup MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow from anywhere)
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/admission_mgmt
   ```

## Step 2: Deploy Backend (Render.com)

1. Push code to GitHub
2. Go to https://render.com
3. Click "New +" → "Web Service"
4. Connect GitHub repository
5. Configure:
   - **Name**: admission-backend
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   
6. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/admission_mgmt
   JWT_SECRET=your_super_secret_key_here
   JWT_EXPIRY=7d
   PORT=5000
   NODE_ENV=production
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

7. Click "Create Web Service"
8. Wait for deployment
9. Copy your backend URL: `https://admission-backend.onrender.com`

## Step 3: Deploy Frontend (Vercel)

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://admission-backend.onrender.com
   ```

6. Click "Deploy"
7. Wait for deployment
8. Copy your frontend URL: `https://admission-frontend.vercel.app`

## Step 4: Update Backend CORS

Go back to Render.com → Your backend service → Environment Variables:
- Update `CLIENT_URL` to your Vercel frontend URL

## Step 5: Seed Database

1. Go to Render.com → Your backend service → Shell
2. Run:
   ```bash
   node seed.js
   ```

## Step 6: Test

1. Visit your frontend URL
2. Login with:
   - Email: `admin@college.com`
   - Password: `admin123`

## Troubleshooting

### CORS Error
- Check `CLIENT_URL` in backend environment variables
- Make sure it matches your frontend URL exactly

### Database Connection Error
- Check MongoDB Atlas connection string
- Verify IP whitelist includes `0.0.0.0/0`
- Check database user credentials

### API Not Found
- Verify `REACT_APP_API_URL` in frontend environment variables
- Check backend is running on Render

## Local Development

### Backend
```bash
cd server
npm install
node seed.js  # Create admin user
npm start
```

### Frontend
```bash
cd client
npm install
npm start
```

## Environment Variables Summary

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/admission_mgmt
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

## Production URLs

After deployment, update your README with:
- Frontend URL: `https://your-app.vercel.app`
- Backend URL: `https://your-backend.onrender.com`
- Admin Login: `admin@college.com` / `admin123`
