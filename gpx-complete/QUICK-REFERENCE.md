# ⚡ QUICK REFERENCE - Deploy in 18 Minutes

## 📥 STEP 1: Download All Files (5 min)
From this chat, download all files into a folder on your Mac:
- Documents → Create folder "gpx-netlify"
- Download everything into that folder

## 📤 STEP 2: Upload to GitHub (3 min)
Go to github.com:
1. New repository: "gpx-diagramming"
2. Upload all files from your gpx-netlify folder
3. Commit changes

## ⚡ STEP 3: Deploy Backend - Railway (5 min)
Go to railway.app:
1. Login with GitHub
2. New Project → Deploy from GitHub repo
3. Select "gpx-diagramming"
4. Choose "server" folder
5. Settings → Generate Domain
6. **COPY THE URL!**

## 🎨 STEP 4: Deploy Frontend - Netlify (3 min)
Go to netlify.com:
1. Add new site → Import from GitHub
2. Select "gpx-diagramming"
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Environment variables → Add:
   - Key: `VITE_SERVER_URL`
   - Value: [Railway URL from Step 3]
6. Deploy!

## ✅ STEP 5: Test (2 min)
1. Open your Netlify URL
2. Enter code: `gpx2026`
3. Drag asset, add text, export
4. Done! 🎉

---

## 🔑 Critical Thing

**In Netlify, you MUST add this environment variable:**
```
VITE_SERVER_URL = https://your-railway-url.up.railway.app
```

---

## 💰 Cost
Everything is FREE!

---

## 📱 Share
Give your team:
- Your Netlify URL
- Access code: gpx2026

---

## 🆘 Problems?
- Build failed? → Check environment variable
- Can't connect? → Verify Railway URL
- Code doesn't work? → It's "gpx2026" lowercase

---

## 📖 Need More Details?
Open: **COMPLETE-GUIDE.md**
