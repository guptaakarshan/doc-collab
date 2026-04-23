import { Server } from 'socket.io';

let io;
const activeUsers = new Map(); // documentId -> Map(userId -> user details)

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    },
    destroyUpgrade: false
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Join the app (for user-specific notifications like document created/deleted)
    socket.on('join-app', (userId) => {
      if (userId) {
        socket.join(`user-${userId}`);
      }
    });

    // Join a document for document-specific events and presence
    socket.on('join-document', ({ documentId, user }) => {
      socket.join(`doc-${documentId}`);
      
      // Handle Presence
      if (!activeUsers.has(documentId)) {
        activeUsers.set(documentId, new Map());
      }
      
      const docUsers = activeUsers.get(documentId);
      if (user && user.id) {
        docUsers.set(user.id, { ...user, socketId: socket.id });
        socket.documentId = documentId;
        socket.userId = user.id;
        
        // Broadcast updated presence
        io.to(`doc-${documentId}`).emit('presence-update', Array.from(docUsers.values()));
      }
    });

    socket.on('leave-document', (documentId) => {
      socket.leave(`doc-${documentId}`);
      
      if (socket.documentId === documentId && socket.userId) {
        const docUsers = activeUsers.get(documentId);
        if (docUsers) {
          docUsers.delete(socket.userId);
          io.to(`doc-${documentId}`).emit('presence-update', Array.from(docUsers.values()));
        }
      }
      
      socket.documentId = null;
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
      if (socket.documentId && socket.userId) {
        const docUsers = activeUsers.get(socket.documentId);
        if (docUsers) {
          docUsers.delete(socket.userId);
          io.to(`doc-${socket.documentId}`).emit('presence-update', Array.from(docUsers.values()));
        }
      }
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}
