# Troubleshooting Guide

## 🔴 Issue: Login Failed After Deployment

### Problem
After deploying successfully, login with `admin@college.com` / `admin123` shows "Login Failed" error.

### Root Cause
The production database is empty - no admin user has been created yet.

---

## ✅ Solutions

### Solution 1: Run Seed Script on Render (Recommended)

1. **Go to Render Dashboard**
   - Navigate to https://dashboard.render.com
   - Click on your backend service

2. **Open Shell/Console**
   - Click on "Shell" tab in the left sidebar
   - Wait for the shell to load

3. **Run the seed command:**
   ```bash
   node seed.js
   ```

4. **Expected Output:**
   ```
   ✅ Connected to MongoDB
   ✅ Admin user created successfully!
   
   📧 Email: admin@college.com
   🔑 Password: admin123
   👤 Role: admin
   ```

5. **Test Login**
   - Go to your frontend URL
   - Login with the credentials above

---

### Solution 2: Use Setup HTML Page

1. **Open the setup page:**
   - Open `setup-admin.html` in your browser
   - Or host it temporarily on any static hosting

2. **Enter your backend URL:**
   ```
   https://your-backend-name.onrender.com
   ```

3. **Click "Create Admin User"**

4. **You should see:**
   ```
   ✅ Success! Admin user created successfully.
   
   Login Credentials:
   Email: admin@college.com
   Password: admin123
   ```

5. **Now try logging in**

---

### Solution 3: Use API Directly (Postman/cURL)

**Using cURL:**
```bash
curl -X POST https://your-backend-name.onrender.com/api/setup/create-admin \
  -H "Content-Type: application/json"
```

**Using Postman:**
1. Method: POST
2. URL: `https://your-backend-name.onrender.com/api/setup/create-admin`
3. Headers: `Content-Type: application/json`
4. Send request

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "credentials": {
    "email": "admin@college.com",
    "password": "admin123"
  }
}
```

---

## 🔍 Other Common Issues

### Issue: CORS Error

**Symptoms:**
- Browser console shows: "Access to fetch blocked by CORS policy"
- Network tab shows failed requests

**Solution:**
1. Check backend environment variable `CLIENT_URL`
2. Make sure it matches your frontend URL exactly
3. Update on Render:
   - Go to your backend service
   - Environment → Edit
   - Update `CLIENT_URL` to your Vercel URL
   - Save and redeploy

**Example:**
```env
CLIENT_URL=https://admission-frontend.vercel.app
```

---

### Issue: Database Connection Error

**Symptoms:**
- Backend logs show: "MongoDB connection error"
- API returns 500 errors

**Solution:**
1. Check MongoDB Atlas connection string
2. Verify IP whitelist includes `0.0.0.0/0`
3. Check database user credentials
4. Update `MONGODB_URI` in Render environment variables

**Steps:**
1. Go to MongoDB Atlas
2. Network Access → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`)
3. Database Access → Verify user exists and has read/write permissions

---

### Issue: Environment Variables Not Working

**Symptoms:**
- Backend can't connect to database
- Frontend shows "undefined" for API URL

**Solution:**

**Backend (Render):**
1. Go to your service → Environment
2. Verify all variables are set:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_secret_key
   PORT=5000
   NODE_ENV=production
   CLIENT_URL=https://your-frontend.vercel.app
   ```
3. Click "Save Changes"
4. Service will auto-redeploy

**Frontend (Vercel):**
1. Go to your project → Settings → Environment Variables
2. Add:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```
3. Redeploy from Deployments tab

---

### Issue: "Admin already exists" Error

**Symptoms:**
- Setup route returns: "Admin user already exists"
- But you still can't login

**Solution:**
This means the admin user exists but password might be wrong.

**Option 1: Reset Password Manually**
1. Go to Render Shell
2. Run:
   ```bash
   node
   ```
3. Then:
   ```javascript
   const mongoose = require('mongoose');
   const bcrypt = require('bcryptjs');
   const User = require('./models/User');
   
   mongoose.connect(process.env.MONGODB_URI).then(async () => {
     const admin = await User.findOne({ email: 'admin@college.com' });
     admin.password = await bcrypt.hash('admin123', 10);
     await admin.save();
     console.log('Password reset successfully');
     process.exit(0);
   });
   ```

**Option 2: Delete and Recreate**
1. Go to MongoDB Atlas
2. Browse Collections → Users
3. Delete the admin user
4. Run `node seed.js` again

---

### Issue: Frontend Shows Blank Page

**Symptoms:**
- Deployed frontend shows blank white page
- Browser console shows errors

**Solution:**
1. Check browser console for errors
2. Verify `REACT_APP_API_URL` is set correctly
3. Check if backend is accessible:
   ```
   https://your-backend.onrender.com/api/health
   ```
4. Redeploy frontend after fixing environment variables

---

### Issue: Render Free Tier Sleeps

**Symptoms:**
- First request takes 30-60 seconds
- Subsequent requests are fast

**Explanation:**
Render free tier services sleep after 15 minutes of inactivity.

**Solutions:**
1. **Accept it** - First request wakes up the service
2. **Upgrade to paid plan** - Services stay awake
3. **Use a ping service** - Keep service awake (e.g., UptimeRobot)

---

## 📝 Verification Checklist

After deployment, verify:

- [ ] Backend is accessible: `https://your-backend.onrender.com/api/health`
- [ ] Frontend loads: `https://your-frontend.vercel.app`
- [ ] Admin user created (run seed.js or setup route)
- [ ] Can login with admin credentials
- [ ] Can create institution
- [ ] Can create program
- [ ] Can create applicant
- [ ] Dashboard shows data

---

## 🆘 Still Having Issues?

### Check Backend Logs
1. Go to Render Dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for error messages

### Check Frontend Console
1. Open your deployed frontend
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Look for error messages

### Common Error Messages

**"Network Error"**
- Backend is down or URL is wrong
- Check `REACT_APP_API_URL`

**"401 Unauthorized"**
- Token expired or invalid
- Try logging out and logging in again

**"403 Forbidden"**
- User doesn't have permission
- Check user role

**"500 Internal Server Error"**
- Backend error
- Check Render logs for details

---

## 📞 Need More Help?

1. Check backend logs on Render
2. Check browser console on frontend
3. Verify all environment variables
4. Make sure MongoDB Atlas is accessible
5. Test API endpoints with Postman

---

## 🔐 Security Note

**Important:** After creating the admin user, the setup route automatically disables itself. It will return "Admin user already exists" on subsequent calls.

If you need to remove this route entirely for production:
1. Delete `server/routes/setupRoutes.js`
2. Remove the route from `server/server.js`
3. Redeploy
