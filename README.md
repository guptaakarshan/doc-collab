# 🚀 Collab Docs

Real-time collaborative document editor built with **MERN + Yjs (CRDT) + Socket.IO**

Collab Docs is a full-stack collaborative editing platform where multiple users can edit documents simultaneously, see live changes, presence, and cursors, and manage documents in a modern, responsive interface.

> **Think of it as a mini Google Docs — built from scratch.**

---

## ✨ Features

### 📝 Core Functionality
- **Real-Time Collaboration**  
  Seamless multi-user editing powered by **Yjs (CRDTs)** — no conflicts, no overwrites.

- **Rich Text Editor (Quill.js)**  
  Supports:
  - Headings (H1, H2)
  - Bold / Italic / Underline
  - Lists & Links

- **Live Presence System**
  - See active users in a document
  - Real-time user count
  - Cursor awareness (via Yjs)

---

### 🔐 Authentication & Security
- JWT-based authentication  
- Secure password hashing with bcrypt  
- Role-based access (Owner / Editor)

---

### 📂 Document Management
- Create, open, delete documents  
- Real-time title updates  
- Instant dashboard sync (via Socket.IO)

---

### ⚡ Real-Time System (Hybrid)
- **Yjs (WebSockets)** → editor content syncing  
- **Socket.IO** →  
  - document creation/deletion  
  - title updates  
  - presence tracking  
  - dashboard updates  

---

### 🎨 UI/UX
- Modern UI with Tailwind CSS  
- Smooth animations (Framer Motion)  
- Fully responsive design  
- Clean SaaS-style layout  

---

## 🧠 Architecture

<img width="702" height="325" alt="Screenshot 2026-04-24 145000" src="https://github.com/user-attachments/assets/6254f7ed-e7a4-40f0-92b4-9f65b2bf8ee8" />


---

## 🔄 Data Flow

### Authentication & CRUD
Client → Express → MongoDB  

### Editor Collaboration
Client ↔ Yjs WebSocket Server  
- Handles real-time text syncing  

### App-wide Events
Client ↔ Socket.IO Server  
Handles:
- document-created  
- document-deleted  
- title updates  
- presence  

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Framer Motion
- React Router
- Axios
- Socket.IO Client
- Yjs + y-quill

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT + bcrypt
- Socket.IO
- y-websocket


## 📁 Project Structure


<img width="483" height="500" alt="Screenshot 2026-04-24 145217" src="https://github.com/user-attachments/assets/48f39a5a-067d-4deb-a133-f5b61967bb58" />

---

## ⚙️ Setup & Installation

### 📌 Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

---

### 🔧 Installation

```bash
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
VITE_WS_URL=ws://localhost:5000/yjs

▶️ Running the App
Start Backend
cd server
npm run dev
Start Frontend
cd client
npm run dev

