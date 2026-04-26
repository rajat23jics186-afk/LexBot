# ⚖️ LexBot – Terminal Commands Guide
# =====================================
# Yeh file padhke aap poora project
# setup, run, aur deploy kar sakte ho
# =====================================


# ╔══════════════════════════════════════════════════════════════╗
# ║          STEP 1 : PROJECT FOLDER SETUP                      ║
# ╚══════════════════════════════════════════════════════════════╝

# Pehle dekho aap kahan ho
pwd

# Desktop pe jao (ya jahan project rakhna ho)
cd Desktop

# LexBot folder kholo VS Code mein (agar already open nahi)
code lexbot


# ╔══════════════════════════════════════════════════════════════╗
# ║          STEP 2 : BACKEND SETUP (Pehle Yeh Karo)           ║
# ╚══════════════════════════════════════════════════════════════╝

# Backend folder mein jao
cd lexbot/backend

# ── Node modules install karo ──────────────────────────────────
# (pehli baar sirf ek baar karna hoga)
# Yeh command package.json padh ke saari libraries download karti hai
npm install

# Agar npm install mein error aaye to yeh try karo
npm install --legacy-peer-deps

# Install ho gayi libraries check karo
# node_modules folder ban gaya hoga
ls


# ╔══════════════════════════════════════════════════════════════╗
# ║          STEP 3 : SERVER START KARO                         ║
# ╚══════════════════════════════════════════════════════════════╝

# ── Normal start (production style) ───────────────────────────
node server.js

# ── Development mode (auto-restart on file save) ───────────────
# File save karte hi server apne aap restart hoga
# Yeh development ke liye best hai
npx nodemon server.js

# ── Agar nodemon globally install karna ho ────────────────────
npm install -g nodemon
nodemon server.js

# Server sahi chala to terminal mein yeh dikhega:
# ⚖️  ================================
# ⚖️  LexBot API Server
# ⚖️  Port    : 5000
# ⚖️  Mode    : development
# ⚖️  Health  : http://localhost:5000/api/health
# ⚖️  ================================
# ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net


# ╔══════════════════════════════════════════════════════════════╗
# ║          STEP 4 : SERVER TEST KARO (Browser Mein)           ║
# ╚══════════════════════════════════════════════════════════════╝

# Yeh URL browser mein kholo – server health check
# http://localhost:5000/api/health

# Sahi response aayega:
# {
#   "success": true,
#   "message": "⚖️ LexBot API is running",
#   "dbState": "connected"
# }


# ╔══════════════════════════════════════════════════════════════╗
# ║          STEP 5 : FRONTEND CHALAO                           ║
# ╚══════════════════════════════════════════════════════════════╝

# VS Code mein index.html pe right click karo
# → "Open with Live Server" click karo
# Browser mein http://127.0.0.1:5500 khul jayega

# ── Agar Live Server extension nahi hai ───────────────────────
# VS Code mein Extensions (Ctrl+Shift+X) kholo
# "Live Server" search karo – Ritwick Dey wala install karo


# ╔══════════════════════════════════════════════════════════════╗
# ║          STEP 6 : MONGODB ATLAS SETUP                       ║
# ╚══════════════════════════════════════════════════════════════╝

# MongoDB Atlas pe FREE account banao: https://mongodb.com/atlas
#
# Steps:
# 1. Sign up → Free tier (M0) select karo
# 2. Cluster banao → Region: Mumbai (ap-south-1)
# 3. Database User banao (username + password yaad rakhna)
# 4. Network Access → "Allow from anywhere" (0.0.0.0/0)
# 5. Connect → "Connect your application" → Connection string copy karo
#
# Connection string kuch aisi hogi:
# mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/lexbot
#
# Yeh string backend/.env mein MONGODB_URI mein daalo


# ╔══════════════════════════════════════════════════════════════╗
# ║          STEP 7 : .ENV FILE CHECK KARO                      ║
# ╚══════════════════════════════════════════════════════════════╝

# .env file ka content dekhna ho to
cat .env

# .env file edit karni ho to (VS Code terminal mein)
# Bas VS Code mein backend/.env file kholo aur edit karo
#
# .env mein yeh hona chahiye:
# PORT=5000
# NODE_ENV=development
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lexbot
# GEMINI_API_KEY=AIzaSyDV_Pp1iC9sI_gRh1Gk2FK1unB_g1tHj2U
# FRONTEND_URL=http://127.0.0.1:5500


# ╔══════════════════════════════════════════════════════════════╗
# ║          STEP 8 : PACKAGE.JSON SCRIPTS                      ║
# ╚══════════════════════════════════════════════════════════════╝

# package.json mein scripts hain:
# "start" → node server.js       (production ke liye)
# "dev"   → nodemon server.js    (development ke liye)

# Development mode start karo (recommended)
npm run dev

# Production mode start karo
npm start


# ╔══════════════════════════════════════════════════════════════╗
# ║          STEP 9 : COMMON ERRORS AUR SOLUTIONS               ║
# ╚══════════════════════════════════════════════════════════════╝

# ── Error: "Cannot find module 'express'" ─────────────────────
# Matlab: npm install nahi kiya
npm install

# ── Error: "Port 5000 already in use" ────────────────────────
# Windows pe yeh karo – port 5000 kaun use kar raha hai dekho
netstat -ano | findstr :5000
# PID note karo aur yeh karo (1234 ki jagah apna PID daalo)
taskkill /PID 1234 /F

# Mac/Linux pe
lsof -ti:5000 | xargs kill -9

# ── Error: "MongoDB connection failed" ────────────────────────
# .env mein MONGODB_URI check karo
# MongoDB Atlas mein Network Access → 0.0.0.0/0 allow hai?
# Username/password sahi hai?

# ── Error: "GEMINI_API_KEY not valid" ─────────────────────────
# .env file mein GEMINI_API_KEY check karo
# Key mein koi space toh nahi?

# ── Server band karna ho ──────────────────────────────────────
# Terminal mein yeh press karo:
Ctrl + C


# ╔══════════════════════════════════════════════════════════════╗
# ║          STEP 10 : GIT SETUP (GitHub pe code daalna)        ║
# ╚══════════════════════════════════════════════════════════════╝

# Pehle lexbot root folder mein jao
cd ..
# (ab tum lexbot/ folder mein ho)

# Git initialize karo
git init

# .gitignore check karo (node_modules aur .env ignore ho)
cat backend/.gitignore

# Saari files stage karo
git add .

# Pehla commit karo
git commit -m "Initial commit - LexBot AI Legal System"

# GitHub pe naya repository banao (github.com → New Repository)
# Name: lexbot
# Public/Private: aapki marzi
# README: No (already hai)

# GitHub se link karo (apna username daalo)
git remote add origin https://github.com/AAPKA_USERNAME/lexbot.git

# Code push karo
git branch -M main
git push -u origin main

# ⚠️ IMPORTANT: .env file GitHub pe nahi jayegi (gitignore mein hai)
# GitHub pe .env KABHI mat daalna – API key leak ho jayegi!


# ╔══════════════════════════════════════════════════════════════╗
# ║          STEP 11 : RENDER PE BACKEND DEPLOY KARO           ║
# ╚══════════════════════════════════════════════════════════════╝

# 1. render.com pe FREE account banao
# 2. "New +" → "Web Service"
# 3. GitHub account connect karo
# 4. lexbot repository select karo
#
# Settings yeh bharo:
# ┌─────────────────────────────────────────────┐
# │ Name        : lexbot-backend                │
# │ Root Dir    : backend                       │
# │ Runtime     : Node                          │
# │ Build Cmd   : npm install                   │
# │ Start Cmd   : node server.js                │
# │ Plan        : Free                          │
# └─────────────────────────────────────────────┘
#
# 5. "Environment Variables" section mein yeh daalo:
#    PORT          = 5000
#    NODE_ENV      = production
#    MONGODB_URI   = (apna Atlas connection string)
#    GEMINI_API_KEY= AIzaSyDV_Pp1iC9sI_gRh1Gk2FK1unB_g1tHj2U
#    FRONTEND_URL  = (Netlify URL jo baad mein milega)
#
# 6. "Create Web Service" click karo
# 7. Deploy hone ke baad URL milega jaise:
#    https://lexbot-backend.onrender.com


# ╔══════════════════════════════════════════════════════════════╗
# ║          STEP 12 : NETLIFY PE FRONTEND DEPLOY KARO          ║
# ╚══════════════════════════════════════════════════════════════╝

# 1. netlify.com pe FREE account banao
# 2. "Add new site" → "Import an existing project"
# 3. GitHub connect karo → lexbot repo select karo
#
# Settings:
# ┌─────────────────────────────────────────────┐
# │ Base directory  : frontend                  │
# │ Build command   : (khali chhodo)            │
# │ Publish dir     : frontend                  │
# └─────────────────────────────────────────────┘
#
# 4. Deploy click karo
# 5. URL milega jaise: https://lexbot-ai.netlify.app
#
# ── Ab script.js update karo ──────────────────────────────────
# frontend/script.js mein line 1 pe:
# const API_BASE = 'https://lexbot-backend.onrender.com/api';
# (localhost ki jagah Render ka URL daalo)
#
# Git commit + push karo – Netlify apne aap update ho jayega
git add frontend/script.js
git commit -m "Update API_BASE to Render URL"
git push


# ╔══════════════════════════════════════════════════════════════╗
# ║          QUICK REFERENCE CARD                               ║
# ╚══════════════════════════════════════════════════════════════╝

# ┌──────────────────────────────────────────────────────────┐
# │  DAILY USE COMMANDS (Development)                        │
# ├──────────────────────────────────────────────────────────┤
# │  cd Desktop/lexbot/backend   → Backend folder mein jao  │
# │  npm run dev                 → Server start karo         │
# │  Ctrl+C                      → Server band karo          │
# │  npm install <package>       → Naya package add karo     │
# ├──────────────────────────────────────────────────────────┤
# │  TEST URLs (server chalne par browser mein kholo)        │
# ├──────────────────────────────────────────────────────────┤
# │  http://localhost:5000/api/health    → Server check      │
# │  http://127.0.0.1:5500              → Frontend (Live)    │
# ├──────────────────────────────────────────────────────────┤
# │  HELPLINES (project mein use hote hain)                  │
# ├──────────────────────────────────────────────────────────┤
# │  Cyber Crime  : 1930                                     │
# │  Consumer     : 1915                                     │
# │  NALSA Legal  : 15100                                    │
# │  Women Help   : 181                                      │
# │  Police       : 100                                      │
# └──────────────────────────────────────────────────────────┘