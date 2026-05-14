const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const prisma = require('./config/database');
const logger = require('./config/logger');
const { s3, createBucket } = require('./config/s3');
const redisClient = require('./config/redis');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('join-room', async ({ roomId, userId }) => {
    socket.join(roomId);
    logger.info(`User ${userId} joined room ${roomId}`);
    
    socket.to(roomId).emit('user-joined', { userId, socketId: socket.id });
  });

  socket.on('leave-room', async ({ roomId, userId }) => {
    socket.leave(roomId);
    logger.info(`User ${userId} left room ${roomId}`);
    
    socket.to(roomId).emit('user-left', { userId, socketId: socket.id });
  });

  socket.on('chat-message', async ({ roomId, userId, message, type = 'text' }) => {
    try {
      await prisma.log.create({
        data: {
          level: 'CHAT',
          message,
          metadata: { type },
          userId,
          roomId,
        },
      });
      
      io.to(roomId).emit('chat-message', { userId, message, type, timestamp: new Date() });
    } catch (error) {
      logger.error('Error saving chat message:', error);
    }
  });

  socket.on('whiteboard-update', ({ roomId, userId, data }) => {
    socket.to(roomId).emit('whiteboard-update', { userId, data });
  });

  socket.on('webrtc-signal', ({ roomId, targetSocketId, signal }) => {
    io.to(targetSocketId).emit('webrtc-signal', { 
      fromSocketId: socket.id, 
      signal 
    });
  });

  socket.on('toggle-audio', ({ roomId, userId, isAudioOn }) => {
    socket.to(roomId).emit('user-audio-toggled', { userId, isAudioOn });
  });

  socket.on('toggle-video', ({ roomId, userId, isVideoOn }) => {
    socket.to(roomId).emit('user-video-toggled', { userId, isVideoOn });
  });

  socket.on('raise-hand', ({ roomId, userId }) => {
    io.to(roomId).emit('hand-raised', { userId, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await createBucket();
    logger.info('MinIO bucket initialized');

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

app.use(notFound);
app.use(errorHandler);

startServer();

module.exports = { app, io };
