# ⚖️ LexBot – AI Legal Information System

## 📁 Project Structure

```
lexbot/
│
├── 📄 README.md                        ← Project guide
│
├── 🌐 frontend/
│   ├── index.html                      ← Main HTML (all sections)
│   ├── style.css                       ← All custom CSS styles
│   └── script.js                       ← All JS logic + chat engine
│
└── ⚙️  backend/
    │
    ├── server.js                       ← Express app entry point
    ├── package.json                    ← Node dependencies
    ├── .env                            ← Secret keys (never commit!)
    ├── .env.example                    ← Safe template for .env
    │
    ├── 📂 config/
    │   ├── db.js                       ← MongoDB connection setup
    │   └── constants.js                ← App-wide constants
    │
    ├── 📂 routes/
    │   ├── chat.js                     ← POST /api/chat
    │   └── history.js                  ← GET/DELETE /api/history
    │
    ├── 📂 controllers/
    │   ├── chatController.js           ← Chat logic + AI API call
    │   └── historyController.js        ← Fetch/delete chat history
    │
    ├── 📂 models/
    │   ├── Chat.js                     ← MongoDB schema: single message
    │   └── Session.js                  ← MongoDB schema: full session
    │
    └── 📂 middleware/
        ├── rateLimiter.js              ← Prevent API abuse
        ├── errorHandler.js             ← Global error responses
        └── logger.js                   ← Request logging
```

## 🚀 Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | HTML5, CSS3, JavaScript |
| Styling    | Tailwind CSS (CDN)      |
| Animations | AOS + GSAP              |
| Backend    | Node.js + Express.js    |
| Database   | MongoDB + Mongoose      |
| AI         | Claude API (Anthropic)  |
| Hosting FE | Netlify / Vercel        |
| Hosting BE | Render                  |

## ⚡ API Endpoints

| Method | Endpoint               | Description             |
|--------|------------------------|-------------------------|
| POST   | /api/chat              | Send message, get reply |
| GET    | /api/history/:session  | Get chat history        |
| DELETE | /api/history/:session  | Delete chat history     |
| GET    | /api/health            | Server health check     |

## 🔐 .env Variables

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster/lexbot
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## 📦 Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in your keys
node server.js
```
