import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import registerDocumentSocket from './sockets/documentSocket.js';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup for plain Quill + room broadcast collaboration.
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST', 'PATCH', 'DELETE'] }
});

// Expose io for HTTP controllers that need to notify connected clients.
app.set('io', io)

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Health check
app.get('/', (req, res) => res.json({ status: 'API running' }));

// Routes (added in later steps)
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

registerDocumentSocket(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));