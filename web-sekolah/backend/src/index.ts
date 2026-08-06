import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 5000;

// ============================================
// START SERVER
// ============================================
const startServer = async () => {
  try {
    console.log('🔌 Connecting to database...');
    const connected = await connectDB();

    if (!connected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    console.log('📦 Database connected successfully');

    // ============================================
    // LOCAL DEVELOPMENT: Start HTTP server
    // ============================================
    if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'production') {
      const httpServer = createServer(app);

      httpServer.listen(PORT, () => {
        console.log(`\n🚀 Server running on port ${PORT}`);
        console.log(`🏥 Health: http://localhost:${PORT}/health`);
        console.log(`📚 API Docs: http://localhost:${PORT}/docs`);
        console.log(`📡 Base URL: http://localhost:${PORT}/api`);
        console.log(`\n✨ Ready to accept requests!\n`);
      });

      // ============================================
      // GRACEFUL SHUTDOWN
      // ============================================
      process.on('SIGTERM', () => {
        console.log('👋 SIGTERM received. Closing server...');
        httpServer.close(() => {
          console.log('💥 Server closed');
          process.exit(0);
        });
      });

      process.on('SIGINT', () => {
        console.log('👋 SIGINT received. Closing server...');
        httpServer.close(() => {
          console.log('💥 Server closed');
          process.exit(0);
        });
      });
    } else {
      // Vercel/Production: Export app only (no listen)
      console.log('📦 Running in serverless mode (Vercel)');
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ============================================
// HANDLE UNHANDLED REJECTIONS
// ============================================
process.on('unhandledRejection', (reason: Error) => {
  console.error('💥 UNHANDLED REJECTION:', reason);
  console.error(reason.stack);
});

process.on('uncaughtException', (error: Error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
  console.error(error.stack);
  process.exit(1);
});

// ============================================
// START
// ============================================
startServer();

// ============================================
// EXPORT FOR VERCEL
// ============================================
export default app;