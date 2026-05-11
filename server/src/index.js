import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import connectDB from './config/db.js';
import { initSocket } from './socket.js';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';

import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

initSocket(server);

// Initialize y-websocket (for document CRDT syncing)
const wss = new WebSocketServer({ noServer: true });
wss.on('connection', setupWSConnection);

server.on('upgrade', (request, socket, head) => {
  const url = request.url;

  if (url.startsWith('/yjs')) {
    // Strip /yjs prefix so y-websocket gets the correct room name
    request.url = url.replace('/yjs', '');
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
  // Socket.IO is attached to the server with destroyUpgrade: false,
  // so it will automatically handle /socket.io requests and ignore /yjs.
});

const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://collab-docs-six.vercel.app',
  'https://collab-docs.akarshan.dev',
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());


// ✅ Health route for uptime pinger
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (req, res) => res.json({ status: 'API running' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});