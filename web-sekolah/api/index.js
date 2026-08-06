// ============================================
// VERCEL SERVERLESS FUNCTION - ENTRY POINT
// ============================================

// Load environment variables
require('dotenv').config();

// Import app (compiled TypeScript)
const app = require('../dist/app').default;

// Export for Vercel serverless
module.exports = app;