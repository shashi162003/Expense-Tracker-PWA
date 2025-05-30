# 🚀 Deployment Guide - Render.com

## Prerequisites
- GitHub account with your code pushed
- Render.com account (free tier available)
- MongoDB Atlas account (free tier available)

## Step 1: Prepare MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/atlas
   - Sign up for free account
   - Create a new cluster (free M0 tier)

2. **Setup Database Access**
   - Go to "Database Access" → "Add New Database User"
   - Create username/password (save these!)
   - Grant "Read and write to any database" permissions

3. **Setup Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This allows Render to connect to your database

4. **Get Connection String**
   - Go to "Clusters" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string (looks like: mongodb+srv://username:password@cluster.mongodb.net/expense-tracker)

## Step 2: Deploy to Render

1. **Create New Web Service**
   - Go to https://render.com
   - Sign up/Login with GitHub
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```
   Name: expense-tracker-api
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

3. **Set Environment Variables**
   Add these environment variables in Render dashboard:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Email Configuration (Gmail)**
   - Enable 2-Factor Authentication on Gmail
   - Generate App Password: Google Account → Security → App passwords
   - Use the 16-character app password as EMAIL_PASS

## Step 3: Test Deployment

1. **Check Service Status**
   - Wait for deployment to complete (5-10 minutes)
   - Check logs for any errors
   - Your API will be available at: https://your-service-name.onrender.com

2. **Test API Endpoints**
   ```bash
   # Health check
   curl https://your-service-name.onrender.com/health
   
   # API status
   curl https://your-service-name.onrender.com/api/status
   ```

3. **Test Registration**
   ```bash
   curl -X POST https://your-service-name.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "password123",
       "weeklyLimit": 1000
     }'
   ```

## Step 4: Update CORS for Frontend

Once you deploy your React app, update the CORS configuration in `app.js`:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-frontend-app.vercel.app',  // Add your frontend URL
    'https://your-custom-domain.com'         // Add custom domain if any
  ],
  credentials: true
};
```

## Important Notes

### Free Tier Limitations
- **Render Free Tier**: Service sleeps after 15 minutes of inactivity
- **MongoDB Atlas Free**: 512MB storage limit
- **Cold Starts**: First request after sleep takes 30-60 seconds

### Production Optimizations
- **Keep-Alive Service**: Consider upgrading to paid tier for 24/7 uptime
- **Database Indexing**: Add indexes for better performance
- **Caching**: Implement Redis for session management
- **Monitoring**: Set up error tracking (Sentry, LogRocket)

### Security Checklist
- ✅ Strong JWT secret (32+ characters)
- ✅ Environment variables set correctly
- ✅ CORS configured for your frontend domain
- ✅ Rate limiting enabled
- ✅ Input validation in place
- ✅ HTTPS enforced (automatic on Render)

## Troubleshooting

### Common Issues
1. **Build Fails**: Check Node.js version in package.json engines
2. **Database Connection**: Verify MongoDB URI and network access
3. **Email Not Working**: Check Gmail app password and 2FA
4. **CORS Errors**: Add frontend domain to CORS whitelist

### Useful Commands
```bash
# Check logs
render logs --service your-service-name

# Restart service
render restart --service your-service-name
```

## Next Steps
1. Deploy React frontend to Vercel/Netlify
2. Update CORS settings with frontend URL
3. Test end-to-end functionality
4. Set up custom domain (optional)
5. Configure monitoring and alerts
