# 🚀 GPX Diagramming - Complete Netlify Deployment Guide

## 📂 Step 1: Organize Your Files on Mac

### Create the Project Folder
1. Open **Finder**
2. Go to **Documents**
3. Create a new folder called **gpx-netlify**
4. Download ALL the files from this chat into that folder

### Your Folder Structure Should Look Like:
```
gpx-netlify/
├── index.html
├── package.json
├── netlify.toml
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── assets/          (22 PNG files)
├── src/
│   ├── components/
│   ├── store/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
└── server/
    ├── server.js
    └── package.json
```

---

## 🌐 Step 2: Upload to GitHub

### Option A: Using GitHub Website (Easiest)

1. **Go to GitHub**
   - Open browser: https://github.com
   - Sign in to your account

2. **Create New Repository**
   - Click **"+"** (top right) → **"New repository"**
   - Name: **gpx-diagramming**
   - Choose **Public**
   - Click **"Create repository"**

3. **Upload Your Files**
   - Click **"uploading an existing file"**
   - Open Finder, go to your **gpx-netlify** folder
   - Select ALL files and folders
   - Drag them into the GitHub page
   - Scroll down, click **"Commit changes"**

### Option B: Using GitHub Desktop

1. **Download GitHub Desktop**
   - https://desktop.github.com
   - Install and sign in

2. **Add Your Project**
   - File → Add Local Repository
   - Choose your **gpx-netlify** folder
   - If error, click "Create Repository" instead

3. **Publish**
   - Click **"Publish repository"**
   - Choose Public or Private
   - Click **"Publish Repository"**

---

## ⚡ Step 3: Deploy Backend on Railway

### Why Railway?
You need a backend server to handle real-time collaboration. Railway is free and perfect for this!

### Deploy Steps:

1. **Go to Railway**
   - Open: https://railway.app
   - Click **"Login"** → **"Login with GitHub"**

2. **Create New Project**
   - Click **"New Project"**
   - Click **"Deploy from GitHub repo"**
   - Select **gpx-diagramming**

3. **Configure Deployment**
   - Railway will ask about the folder
   - Select: **server** folder
   - Railway auto-detects Node.js and deploys!

4. **Wait for Deployment** (2-3 minutes)
   - Watch the logs (green text = good!)
   - Wait for "Build successful"

5. **Get Your Backend URL**
   - Click on your deployed service
   - Go to **Settings** tab
   - Scroll to **Networking** or **Domains**
   - Click **"Generate Domain"**
   - You'll get a URL like: `https://gpx-server-production-xxxx.up.railway.app`
   - **COPY THIS URL - YOU NEED IT FOR NETLIFY!**

✅ **Backend is live!**

---

## 🎨 Step 4: Deploy Frontend on Netlify

### You Know Netlify Already! Here's What to Do:

1. **Go to Netlify**
   - Open: https://app.netlify.com
   - Sign in

2. **Add New Site**
   - Click **"Add new site"**
   - Click **"Import an existing project"**
   - Choose **"GitHub"**

3. **Select Your Repository**
   - Find and click **gpx-diagramming**

4. **Configure Build Settings**
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `dist`
   - Leave everything else as default

5. **Add Environment Variable** ⚠️ CRITICAL!
   
   **Before clicking Deploy:**
   
   - Scroll down to **"Environment variables"**
   - Click **"Add environment variables"**
   - Click **"New variable"**
   
   Add this:
   ```
   Key: VITE_SERVER_URL
   Value: [Paste your Railway URL from Step 3.5]
   ```
   
   Example: `https://gpx-server-production-xxxx.up.railway.app`
   
   - Click **"Add variable"**

6. **Deploy!**
   - Click **"Deploy [site name]"** button
   - Wait 2-3 minutes
   - Netlify builds your app

7. **Get Your URL**
   - Once deployed, you'll see: "Site is live"
   - Your URL: `https://[random-name].netlify.app`
   - Click it to open!

✅ **Frontend is live!**

---

## 🎯 Step 5: Test Your App

1. **Open your Netlify URL**
2. **Enter access code:** `gpx2026`
3. **Test features:**
   - Drag an asset from left drawer onto canvas
   - Click Text tool (T), click canvas, type something
   - Resize objects by dragging corners
   - Export as PNG

4. **Test Collaboration:**
   - Open URL in another browser tab
   - Enter code: `gpx2026`
   - Make changes in one tab
   - See them appear in other tab!

🎉 **If everything works, you're done!**

---

## 🔗 Your Live URLs

After deployment:
- **Your App:** https://[your-site].netlify.app
- **Backend:** https://[your-server].up.railway.app
- **Access Code:** gpx2026

**Share the Netlify URL with your team!**

---

## 🎨 Optional: Custom Domain

In Netlify:
1. Site settings → Domain management
2. Add custom domain
3. Follow Netlify's DNS instructions

Or keep the free .netlify.app domain!

---

## 🔄 Making Updates

When you want to change something:

1. **Edit files locally** on your Mac
2. **Upload to GitHub:**
   - GitHub Desktop: Commit → Push
   - Or upload new files on GitHub website
3. **Netlify auto-rebuilds!** (takes 2-3 min)

---

## 💰 Costs

| Service | What | Cost |
|---------|------|------|
| **GitHub** | Code storage | FREE |
| **Railway** | Backend server | FREE* |
| **Netlify** | Frontend hosting | FREE |
| **Total** | Everything | **$0/month** |

*Railway gives $5 credit/month - plenty for this app

---

## 🆘 Troubleshooting

### "Build failed" on Netlify
**Fix:**
- Check Build command is: `npm install && npm run build`
- Check Publish directory is: `dist` (lowercase)
- Verify environment variable is set

### "Cannot connect to server"
**Fix:**
- Go to Netlify → Site settings → Environment variables
- Check `VITE_SERVER_URL` is set correctly
- Must be the full Railway URL with https://
- Redeploy: Deploys → Trigger deploy

### "Access code doesn't work"
**Fix:**
- Code is: `gpx2026` (lowercase, no spaces)
- Clear browser cache: Cmd+Shift+Delete
- Try incognito mode

### Railway asks for credit card
**Fix:**
- Railway free tier requires card verification (won't charge)
- Or use Render.com instead (no card needed)
- Same process, just at render.com

### "Assets not loading"
**Fix:**
- Make sure `public/assets/` folder uploaded to GitHub
- Should have 22 PNG files
- Check on GitHub.com that they're there

---

## 📱 Sharing With Team

1. Copy your Netlify URL
2. Send to team: "Here's our diagram tool: [URL]"
3. Tell them: "Access code is gpx2026"
4. They can use it from any device!

---

## ✅ Deployment Checklist

**Before you start:**
- [ ] All files downloaded to `gpx-netlify` folder
- [ ] GitHub account ready
- [ ] Netlify account ready

**Backend (Railway):**
- [ ] Account created
- [ ] Server deployed
- [ ] Domain generated
- [ ] URL copied

**Frontend (Netlify):**
- [ ] Repository imported
- [ ] Build settings configured
- [ ] Environment variable added
- [ ] Site deployed
- [ ] URL tested

**Final checks:**
- [ ] Can open Netlify URL
- [ ] Can enter access code
- [ ] Can drag assets
- [ ] Can add text
- [ ] Can export
- [ ] Tested in second tab (collaboration works)

---

## 🎓 What You Built

A professional collaboration tool with:
- ✅ Real-time collaboration (10 users)
- ✅ 22 custom diagram assets
- ✅ Text tool with formatting
- ✅ Drag, resize, rotate objects
- ✅ Auto-save every 5 seconds
- ✅ Export PNG & PDF
- ✅ Keyboard shortcuts
- ✅ Mobile responsive

**All for free!** 🎉

---

## 💡 Pro Tips

**Netlify:**
- Change site name: Site settings → Change site name
- Enable deploy notifications
- Set up custom domain for professional look

**Railway:**
- Monitor usage: Dashboard → Usage
- Free tier resets monthly
- Check server status anytime

**Usage:**
- Share URL only with your team
- Keep access code secure
- Export important diagrams regularly
- First load may take 30 sec (server waking up)

---

## 📞 Need More Help?

**GitHub Issues:**
- Make sure all files uploaded
- Check folder structure matches above

**Railway Issues:**
- Docs: https://docs.railway.app
- Make sure `server` folder selected

**Netlify Issues:**
- You're an expert! 😊
- Just remember the environment variable!

**App Issues:**
- Both services must be deployed
- Environment variable must be set
- Use full Railway URL with https://

---

## 🚀 You're Ready!

Follow the steps in order:
1. Organize files (5 min)
2. Upload to GitHub (3 min)
3. Deploy to Railway (5 min)
4. Deploy to Netlify (3 min)
5. Test and share! (2 min)

**Total: 18 minutes**

**You've got this!** Let's build something amazing! 🎨
