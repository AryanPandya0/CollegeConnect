import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';
import { initializeSocket } from './config/socket.js';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io (handles connection, auth, chat & notification sockets)
initializeSocket(server);

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    server.listen(env.PORT, () => {
      console.log(`
========================================
  CollegeConnect Server is running!
========================================
  Environment: ${env.NODE_ENV}
  Port: ${env.PORT}
  API URL: http://localhost:${env.PORT}/api
  Socket.io: Enabled
========================================
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  console.error('Shutting down server...');
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  console.error('Shutting down server...');
  server.close(() => {
    process.exit(1);
  });
});

// Start the server
startServer();
