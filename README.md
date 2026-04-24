🚀 Collab Docs

Real-time collaborative document editor built with MERN + Yjs (CRDT) + Socket.IO

Collab Docs is a full-stack collaborative editing platform where multiple users can edit documents simultaneously, see live changes, presence, and cursors, and manage documents in a modern, responsive interface.

Think of it as a mini Google Docs — built from scratch.

✨ Features
📝 Core Functionality
Real-Time Collaboration
Seamless multi-user editing powered by Yjs (CRDTs) — no conflicts, no overwrites.
Rich Text Editor
Built using Quill.js, supporting:
Headings (H1, H2)
Bold / Italic / Underline
Lists & Links
Live Presence System
See active users in a document
Real-time user count
Cursor awareness (via Yjs)
🔐 Authentication & Security
JWT-based authentication
Secure password hashing with bcrypt
Protected routes & role-based access (Owner / Editor)
📂 Document Management
Create, open, delete documents
Real-time title updates
Instant dashboard sync (via Socket.IO)
⚡ Real-Time System (Hybrid Approach)
Yjs (WebSockets) → handles editor content syncing
Socket.IO → handles:
Document creation/deletion
Title updates
Presence tracking
Dashboard updates
🎨 UI/UX
Modern UI with Tailwind CSS
Smooth animations using Framer Motion
Responsive layout (mobile → desktop)
Clean SaaS-style design
🧠 Architecture

This project uses a hybrid real-time architecture:

           ┌────────────────────┐
           │     React App      │
           └─────────┬──────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   REST API                 WebSockets
 (Express.js)        ┌────────────┴────────────┐
                     │                         │
                Socket.IO                  Yjs Server
        (events & presence)       (CRDT document sync)
🔄 Data Flow
Authentication & CRUD
Client → Express → MongoDB
Editor Collaboration
Client ↔ Yjs WebSocket Server
Handles real-time text syncing
App-wide Real-Time Events
Client ↔ Socket.IO Server
Handles:
document-created
document-deleted
title updates
presence
🛠️ Tech Stack
Frontend
React (Vite)
Tailwind CSS
Framer Motion
React Router
Axios
Socket.IO Client
Yjs + y-quill
Backend
Node.js
Express.js
MongoDB (Mongoose)
JWT + bcrypt
Socket.IO
y-websocket
📁 Project Structure
collab-docs/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── yjs/
│   │   ├── socket.js
│   │   └── index.js
│
└── README.md
⚙️ Setup & Installation
📌 Prerequisites
Node.js (v18+)
MongoDB (Local or Atlas)
🔧 Installation
git clone <your-repo-url>
cd collab-docs
Install backend
cd server
npm install
Install frontend
cd ../client
npm install
🔑 Environment Variables
Server (server/.env)
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
Client (client/.env)
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
▶️ Running the App
Start Backend
cd server
npm run dev
Start Frontend
cd client
npm run dev
🌐 Access the App

👉 http://localhost:5173
