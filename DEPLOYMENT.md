# 🚀 Sonic Canvas Deployment Guide

Complete guide to deploy your multiplayer audio-visual game online!

## 📋 Quick Overview

Sonic Canvas consists of two parts:
1. **Backend** (Node.js + Socket.io) - Handles real-time multiplayer
2. **Frontend** (React + Vite) - The game interface

We'll deploy both and connect them together.

---

## 🎯 Recommended: Render.com (Free Tier Available)

**Best for:** Complete beginners, free hosting for both frontend & backend

### Step 1: Prepare Your Repository

1. Initialize git (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Sonic Canvas"
   ```

2. Create a GitHub repository and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/sonic-canvas.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `sonic-canvas-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add environment variable:
   - **Key**: `CORS_ORIGINS`
   - **Value**: Leave empty for now (we'll update after frontend deploy)
6. Click **"Create Web Service"**
7. **Save your backend URL** (e.g., `https://sonic-canvas-backend.onrender.com`)

### Step 3: Deploy Frontend on Render

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect same GitHub repository
3. Configure:
   - **Name**: `sonic-canvas-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`
   - **Plan**: Free
4. Add environment variable:
   - **Key**: `VITE_SOCKET_URL`
   - **Value**: Your backend URL from Step 2 (e.g., `https://sonic-canvas-backend.onrender.com`)
5. Click **"Create Static Site"**
6. **Save your frontend URL** (e.g., `https://sonic-canvas.onrender.com`)

### Step 4: Update Backend CORS

1. Go back to your backend service on Render
2. Go to **"Environment"** tab
3. Update `CORS_ORIGINS` variable:
   - **Value**: Your frontend URL (e.g., `https://sonic-canvas.onrender.com`)
4. Click **"Save Changes"** (backend will automatically redeploy)

### Step 5: Test! 🎉

1. Visit your frontend URL
2. Click "Start Audio"
3. Start clicking to create sounds!
4. Open in another browser/device to test multiplayer

---

## 🔷 Alternative: Vercel (Frontend) + Railway (Backend)

**Best for:** Better performance, still has free tiers

### Backend on Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway auto-detects Node.js
5. Add environment variables:
   - `PORT`: (Railway sets automatically)
   - `CORS_ORIGINS`: (add after deploying frontend)
6. Deploy and **save the URL** (e.g., `https://sonic-canvas-production.up.railway.app`)

### Frontend on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variable:
   - **Key**: `VITE_SOCKET_URL`
   - **Value**: Your Railway backend URL
6. Click **"Deploy"**
7. **Save your Vercel URL**

### Update Railway CORS

1. Go back to Railway dashboard
2. Add environment variable:
   - `CORS_ORIGINS`: Your Vercel URL (e.g., `https://sonic-canvas.vercel.app`)
3. Redeploy

---

## 🟣 Alternative: Netlify (Frontend) + Render (Backend)

### Backend on Render
(Same as Render.com instructions above)

### Frontend on Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub and select repository
4. Configure:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
5. Add environment variable:
   - **Key**: `VITE_SOCKET_URL`
   - **Value**: Your backend URL
6. Click **"Deploy site"**

---

## ⚙️ Environment Variables Reference

### Backend (.env)
```bash
PORT=3001                          # Auto-set by hosting platforms
CORS_ORIGINS=https://your-frontend-url.com
```

### Frontend (client/.env)
```bash
VITE_SOCKET_URL=https://your-backend-url.com
```

---

## 🔧 Troubleshooting

### ❌ "Cannot connect to server"
- Check `VITE_SOCKET_URL` matches your backend URL exactly
- Ensure backend is running (check Render/Railway logs)
- Verify CORS_ORIGINS includes your frontend URL

### ❌ "WebSocket connection failed"
- Make sure backend URL uses `https://` (not `http://`)
- Check if hosting platform supports WebSockets (all recommended platforms do)
- Check browser console for detailed error messages

### ❌ "Audio not working"
- Click "Start Audio" button (required for browser audio policy)
- Check if browser allows audio (no autoplay blockers)

### ❌ Render free tier sleeps
- Free tier on Render sleeps after 15 min of inactivity
- First request takes ~30s to wake up
- Upgrade to paid tier for 24/7 uptime

### ❌ Build fails
- Check Node version compatibility (use Node 18+)
- Ensure all dependencies are in package.json
- Check build logs for specific errors

---

## 📊 Platform Comparison

| Platform | Frontend | Backend | Free Tier | Notes |
|----------|----------|---------|-----------|-------|
| **Render** | ✅ Static | ✅ Web Service | ✅ Yes | Sleeps after 15min inactive |
| **Vercel** | ✅ Excellent | ❌ No | ✅ Yes | Best for frontend, fast CDN |
| **Netlify** | ✅ Excellent | ❌ No | ✅ Yes | Alternative to Vercel |
| **Railway** | ❌ No | ✅ Excellent | ⚠️ Limited | $5 free credit/month |
| **Fly.io** | ✅ Static | ✅ Web Service | ✅ Yes | Good performance globally |

---

## 🚀 Advanced: Custom Domain

### On Render
1. Go to your site → Settings → Custom Domain
2. Add your domain (e.g., `sonic-canvas.com`)
3. Update DNS records as instructed
4. SSL certificate auto-generated

### On Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records
4. Auto SSL

---

## 📝 Post-Deployment Checklist

- [ ] Backend is deployed and accessible
- [ ] Frontend is deployed and loads
- [ ] Can click "Start Audio" successfully
- [ ] Sounds play when clicking canvas
- [ ] Can switch color palettes
- [ ] Multiplayer works (open 2+ tabs/devices)
- [ ] Users panel shows connected users
- [ ] Room switching works
- [ ] No console errors

---

## 🎮 Testing Multiplayer

1. Open your deployed site in one browser
2. Open same URL in another browser/incognito/device
3. Both should show in Users panel
4. Clicks from one should create particles/sound on others
5. Try joining different rooms

---

## 💡 Tips

- **Free Tier Optimization**: Render free tier sleeps, so first load is slow. Keep a tab open during demo time!
- **Performance**: Use paid tiers for production/portfolio projects
- **Monitoring**: Check platform dashboards for uptime/errors
- **Updates**: Push to GitHub → Platforms auto-redeploy
- **Logs**: All platforms provide real-time logs for debugging

---

## 🆘 Need Help?

Common issues:
1. **CORS errors**: Double-check environment variables match exactly
2. **Build errors**: Run `npm run build` locally first
3. **WebSocket fails**: Ensure using HTTPS URLs in production
4. **Audio issues**: Browser security requires user interaction (the "Start Audio" button handles this)

---

## 🎉 You're Live!

Share your game:
- Tweet your link with #SonicCanvas
- Add to your portfolio
- Share with friends for multiplayer sessions!

Happy deploying! 🚀🎵
