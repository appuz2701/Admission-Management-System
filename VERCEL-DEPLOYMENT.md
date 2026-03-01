# Vercel Deployment Guide

## 🚀 Deploy to Vercel (Both Frontend & Backend)

### Prerequisites
- Vercel account (free tier works)
- MongoDB Atlas account (free tier)
- GitHub repository with your code

---

## 📋 Step-by-Step Guide

### Step 1: Setup MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create database user:
   - Username: `admin`
   - Password: (generate strong password)
4. Network Access:
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (`0.0.0.0/0`)
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string:
   ```
   mongodb+srv://admin:<password>@cluster.mongodb.net/admission_mgmt
   ```
   - Replace `<password>` with your actual password

---

### Step 2: Deploy Backend to Vercel

1. **Push code to GitHub** (if not already done)

2. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New" → "Project"

3. **Import Repository**
   - Select your GitHub repository
   - Click "Import"

4. **Configure Backend Project**
   - **Project Name**: `admission-backend` (or your choice)
   - **Framework Preset**: Other
   - **Root Directory**: `server`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty

5. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster.mongodb.net/admission_mgmt
   JWT_SECRET=your_super_secret_jwt_key_change_this
   JWT_EXPIRY=7d
   PORT=5000
   NODE_ENV=production
   CLIENT_URL=https://your-frontend.vercel.app
   ```
   
   **Important:** You'll update `CLIENT_URL` after deploying frontend

6. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your backend URL: `https://admission-backend.vercel.app`

---

### Step 3: Create Admin User

After backend is deployed, you need to create the admin user.

**Option 1: Visit Seed Endpoint**
```
https://your-backend.vercel.app/api/seed
```

Just open this URL in your browser. You should see:
```json
{
  "success": true,
  "message": "Admin user created successfully!",
  "credentials": {
    "email": "admin@college.com",
    "password": "admin123"
  }
}
```

**Option 2: Use Setup HTML Page**
1. Open `setup-admin.html` in browser
2. Enter: `https://your-backend.vercel.app`
3. Click "Create Admin User"

---

### Step 4: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard**
   - Click "Add New" → "Project"

2. **Import Same Repository**
   - Select your GitHub repository again
   - Click "Import"

3. **Configure Frontend Project**
   - **Project Name**: `admission-frontend` (or your choice)
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

4. **Add Environment Variable**
   ```
   REACT_APP_API_URL=https://your-backend.vercel.app
   ```
   
   Use the backend URL from Step 2

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment
   - Copy your frontend URL: `https://admission-frontend.vercel.app`

---

### Step 5: Update Backend CORS

1. **Go back to Backend Project**
   - Vercel Dashboard → Your backend project
   - Settings → Environment Variables

2. **Update CLIENT_URL**
   ```
   CLIENT_URL=https://your-frontend.vercel.app
   ```
   
   Use the exact frontend URL from Step 4

3. **Redeploy Backend**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

### Step 6: Test Your Application

1. **Visit your frontend URL**
   ```
   https://your-frontend.vercel.app
   ```

2. **Login with admin credentials**
   ```
   Email: admin@college.com
   Password: admin123
   ```

3. **Verify everything works**
   - Dashboard loads
   - Can create institution
   - Can create programs
   - Can create applicants

---

## 🔧 Troubleshooting

### Issue: "Login Failed"

**Solution:** Create admin user first
- Visit: `https://your-backend.vercel.app/api/seed`
- Or use `setup-admin.html`

---

### Issue: CORS Error

**Symptoms:**
```
Access to fetch at 'https://backend.vercel.app/api/...' from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```

**Solution:**
1. Check backend `CLIENT_URL` environment variable
2. Must match frontend URL exactly (including https://)
3. No trailing slash
4. Redeploy backend after changing

---

### Issue: Database Connection Error

**Symptoms:**
- API returns 500 errors
- Backend logs show MongoDB connection error

**Solution:**
1. Check MongoDB Atlas connection string
2. Verify password is correct (no special characters that need encoding)
3. Check IP whitelist includes `0.0.0.0/0`
4. Test connection string locally first

---

### Issue: Environment Variables Not Working

**Solution:**
1. Go to Vercel project → Settings → Environment Variables
2. Verify all variables are set
3. Make sure there are no extra spaces
4. Redeploy after adding/changing variables

---

### Issue: API Routes Not Found (404)

**Symptoms:**
- Frontend shows "Network Error"
- API calls return 404

**Solution:**
1. Check `vercel.json` exists in server folder
2. Verify `REACT_APP_API_URL` in frontend
3. Test backend directly: `https://your-backend.vercel.app/api/health`

---

## 📝 Vercel-Specific Notes

### Serverless Functions
- Vercel runs your backend as serverless functions
- Each API call is a separate function invocation
- Cold starts may cause first request to be slow (1-2 seconds)

### Database Connection
- Use connection pooling
- MongoDB Atlas is recommended
- Don't use local MongoDB

### File Uploads
- Vercel has 4.5MB request limit
- For file uploads, use external storage (Cloudinary, S3)

### Logs
- View logs in Vercel Dashboard → Your Project → Logs
- Real-time logs available
- Filter by function, status, etc.

---

## 🎯 Quick Reference

### Backend URL Format
```
https://your-backend-name.vercel.app
```

### Frontend URL Format
```
https://your-frontend-name.vercel.app
```

### Seed Endpoint
```
https://your-backend-name.vercel.app/api/seed
```

### Health Check
```
https://your-backend-name.vercel.app/api/health
```

---

## 🔄 Redeployment

### When to Redeploy

**Backend:**
- After changing environment variables
- After code changes
- After updating CORS settings

**Frontend:**
- After changing `REACT_APP_API_URL`
- After code changes

### How to Redeploy

1. Go to Vercel Dashboard
2. Select your project
3. Go to Deployments tab
4. Click "..." on latest deployment
5. Click "Redeploy"

Or push to GitHub - Vercel auto-deploys on push!

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] IP whitelist set to `0.0.0.0/0`
- [ ] Backend deployed to Vercel
- [ ] Backend environment variables set
- [ ] Admin user created via `/api/seed`
- [ ] Frontend deployed to Vercel
- [ ] Frontend `REACT_APP_API_URL` set
- [ ] Backend `CLIENT_URL` updated with frontend URL
- [ ] Backend redeployed after CORS update
- [ ] Can login with admin credentials
- [ ] All features working

---

## 🆘 Still Having Issues?

1. **Check Vercel Logs**
   - Dashboard → Your Project → Logs
   - Look for error messages

2. **Check Browser Console**
   - F12 → Console tab
   - Look for network errors

3. **Test Backend Directly**
   - Visit: `https://your-backend.vercel.app/api/health`
   - Should return: `{"success":true,"message":"Server is running"}`

4. **Verify Environment Variables**
   - Backend: Settings → Environment Variables
   - Frontend: Settings → Environment Variables
   - Make sure all are set correctly

---

## 📞 Common URLs

After deployment, save these URLs:

```
Frontend: https://your-frontend.vercel.app
Backend: https://your-backend.vercel.app
Seed: https://your-backend.vercel.app/api/seed
Health: https://your-backend.vercel.app/api/health

Admin Login:
Email: admin@college.com
Password: admin123
```
