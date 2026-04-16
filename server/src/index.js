import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup (we'll wire Yjs here in Step 4)
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] }
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Health check
app.get('/', (req, res) => res.json({ status: 'API running' }));

// Routes (added in later steps)
app.use('/api/auth', authRoutes);
// app.use('/api/documents', documentRoutes);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));