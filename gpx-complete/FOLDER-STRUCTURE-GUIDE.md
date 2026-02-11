# 📁 HOW TO ORGANIZE YOUR FILES

You now have all the individual files! Here's how to organize them on your Mac.

## 🗂️ Create This Folder Structure

In your **Documents** folder, create this exact structure:

```
Documents/
  └── gpx-netlify/
      ├── package.json
      ├── netlify.toml
      ├── vite.config.js
      ├── tailwind.config.js
      ├── postcss.config.js
      ├── index.html
      ├── COMPLETE-GUIDE.md
      ├── QUICK-REFERENCE.md
      ├── FILE-CHECKLIST.md
      │
      ├── src/
      │   ├── main.jsx
      │   ├── App.jsx
      │   ├── index.css
      │   ├── components/
      │   │   ├── LandingPage.jsx
      │   │   ├── Toolbar.jsx
      │   │   ├── AssetDrawer.jsx
      │   │   ├── Canvas.jsx
      │   │   └── ExportModal.jsx
      │   ├── store/
      │   │   └── useStore.js
      │   └── utils/
      │       └── socket.js
      │
      ├── public/
      │   └── assets/
      │       ├── Action step.png
      │       ├── assemble.png
      │       ├── assess.png
      │       ├── caution step.png
      │       ├── caution.png
      │       ├── collect.png
      │       ├── connect.png
      │       ├── decompose.png
      │       ├── end hold.png
      │       ├── end.png
      │       ├── inputs.png
      │       ├── integrate.png
      │       ├── lethal.png
      │       ├── power off.png
      │       ├── power on.png
      │       ├── readiness.png
      │       ├── start hold.png
      │       ├── start.png
      │       ├── stop.png
      │       ├── tool.png
      │       └── transform.png
      │
      └── server/
          ├── server.js
          └── package.json
```

## 📋 Step-by-Step Instructions

### 1. Create Main Folder
- Open **Finder**
- Go to **Documents**
- Create new folder: **gpx-netlify**

### 2. Download & Place Root Files
Download these into `gpx-netlify/`:
- package.json
- netlify.toml
- vite.config.js
- tailwind.config.js
- postcss.config.js
- index.html
- COMPLETE-GUIDE.md
- QUICK-REFERENCE.md
- FILE-CHECKLIST.md

### 3. Create src Folder Structure
Inside `gpx-netlify/`, create folders:
- `src/`
- `src/components/`
- `src/store/`
- `src/utils/`

Then download and place:
- **Into src/:** main.jsx, App.jsx, index.css
- **Into src/components/:** LandingPage.jsx, Toolbar.jsx, AssetDrawer.jsx, Canvas.jsx, ExportModal.jsx
- **Into src/store/:** useStore.js
- **Into src/utils/:** socket.js

### 4. Create public Folder Structure
Inside `gpx-netlify/`, create folders:
- `public/`
- `public/assets/`

Then download all 21 PNG images into `public/assets/`:
- Action step.png
- assemble.png
- assess.png
- caution step.png
- caution.png
- collect.png
- connect.png
- decompose.png
- end hold.png
- end.png
- inputs.png
- integrate.png
- lethal.png
- power off.png
- power on.png
- readiness.png
- start hold.png
- start.png
- stop.png
- tool.png
- transform.png

### 5. Create server Folder
Inside `gpx-netlify/`, create folder:
- `server/`

Then download into `server/`:
- server.js
- package.json (the one labeled as being from server folder)

## ✅ Verify Your Structure

When done, your `gpx-netlify` folder should have:
- 9 files at the root level
- 1 `src` folder with 3 subfolders
- 1 `public` folder with 1 subfolder
- 1 `server` folder

**Total at root: 11 items (9 files + 3 folders)**

## 🚀 After Organizing

Once everything is organized:
1. Open **COMPLETE-GUIDE.md** or **QUICK-REFERENCE.md**
2. Follow the deployment steps
3. Upload to GitHub
4. Deploy to Railway and Netlify

## 💡 Tips

- Keep the exact file names (don't rename anything)
- Respect the folder structure exactly as shown
- Make sure PNG files go into `public/assets/`
- The two `package.json` files are different - one for root, one for server

## 🆘 Having Trouble?

The key folders are:
- **src/** = Your app code
- **public/assets/** = The 21 diagram images
- **server/** = Backend code

Make sure each file goes into the correct folder!

---

**Once organized, you're ready to deploy!** 🎉
