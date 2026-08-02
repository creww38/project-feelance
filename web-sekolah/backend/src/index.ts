import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

const startServer = async () => {
  try {
    console.log('🔌 Connecting to database...');
    const connected = await connectDB();

    if (!connected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();