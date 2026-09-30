const app = require('./app');
const env = require('./config/env');

const server = app.listen(env.PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Student Opportunity AI Backend running on port ${env.PORT}`);
  console.log(`📡 Health Check: http://localhost:${env.PORT}/api/health`);
  console.log(`📋 API Docs: Refer to API_CONTRACT.md`);
  console.log(`=================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});
