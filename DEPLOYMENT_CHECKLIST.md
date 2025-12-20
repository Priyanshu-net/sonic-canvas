# 🚀 Pre-Deployment Checklist

Use this checklist before deploying to production!

## ✅ Code Preparation

- [x] Environment variables configured
  - [x] Server uses `process.env.PORT`
  - [x] Server uses `process.env.CORS_ORIGINS`
  - [x] Client uses `import.meta.env.VITE_SOCKET_URL`
  - [x] `.env.example` files created for both

- [x] Build configuration
  - [x] Client builds successfully (`cd client && npm run build`)
  - [x] Server starts without errors (`npm start`)
  - [x] No console errors in production build

- [x] Git ready
  - [x] `.gitignore` includes `.env`, `node_modules/`, `dist/`
  - [x] All changes committed
  - [x] Repository pushed to GitHub

## ✅ Testing Locally

- [ ] Backend runs on port 3001
- [ ] Frontend runs on port 5173
- [ ] Can click "Start Audio" successfully
- [ ] Sounds play when clicking
- [ ] All 4 palettes work (Neon, Sunset, Ocean, Galaxy)
- [ ] Palette changes affect sound and visuals
- [ ] Can join different rooms
- [ ] Multiplayer works (test with 2+ browser tabs)
- [ ] Users panel shows connected users
- [ ] Energy bar fills when clicking
- [ ] Combo counter works
- [ ] No errors in browser console
- [ ] No errors in server terminal

## ✅ Deployment Steps

### 1. Backend Deployment
- [ ] Platform chosen (Render/Railway/Fly.io)
- [ ] Repository connected
- [ ] Build command set: `npm install`
- [ ] Start command set: `npm start`
- [ ] Environment variables added:
  - [ ] `PORT` (auto or manual)
  - [ ] `CORS_ORIGINS` (will update after frontend)
- [ ] Deployed successfully
- [ ] Backend URL saved: `________________________________`

### 2. Frontend Deployment
- [ ] Platform chosen (Render/Vercel/Netlify)
- [ ] Repository connected
- [ ] Build command set: `cd client && npm install && npm run build`
- [ ] Publish directory set: `client/dist` (or `dist`)
- [ ] Environment variable added:
  - [ ] `VITE_SOCKET_URL` = your backend URL
- [ ] Deployed successfully
- [ ] Frontend URL saved: `________________________________`

### 3. CORS Update
- [ ] Return to backend deployment
- [ ] Update `CORS_ORIGINS` to frontend URL
- [ ] Backend redeployed successfully

## ✅ Post-Deployment Testing

- [ ] Frontend loads without errors
- [ ] "Start Audio" button appears
- [ ] Can start audio successfully
- [ ] Click creates sound and visuals
- [ ] All 4 palettes work
- [ ] Can switch rooms
- [ ] Test multiplayer:
  - [ ] Open site on desktop
  - [ ] Open site on mobile/another device
  - [ ] Both users appear in Users panel
  - [ ] Clicks from one device appear on other
- [ ] No CORS errors in console
- [ ] No WebSocket errors
- [ ] Check mobile responsiveness

## ✅ Performance Check

- [ ] Initial load time < 5 seconds
- [ ] Audio latency minimal
- [ ] Particles render smoothly
- [ ] 3D physics runs at good FPS
- [ ] Multiple users don't cause lag

## ✅ Documentation

- [ ] README.md updated with live URL
- [ ] DEPLOYMENT.md reviewed
- [ ] Environment variable examples documented

## 🎉 Ready to Share!

Once all checkboxes are complete:
- [ ] Add live URL to GitHub repository description
- [ ] Share with friends for testing
- [ ] Add to portfolio
- [ ] Post on social media! 🚀

---

## 🆘 Troubleshooting

If something doesn't work:

1. **Check browser console** (F12) for errors
2. **Check backend logs** on hosting platform
3. **Verify environment variables** match exactly
4. **Test CORS** - frontend URL must be in backend CORS_ORIGINS
5. **Check WebSocket connection** - must use WSS (secure) in production
6. **Review DEPLOYMENT.md** for specific platform issues

---

## 📝 Deployment URLs

Fill these in as you deploy:

**Backend URL:** `________________________________`

**Frontend URL:** `________________________________`

**GitHub Repo:** `________________________________`

**Deployment Date:** `________________________________`

---

Good luck! 🚀🎵
