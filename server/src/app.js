const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const env = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const { sendSuccess } = require('./utils/response');

// Route imports
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const trackerRoutes = require('./routes/trackerRoutes');
const aiRoutes = require('./routes/aiRoutes');
const exportRoutes = require('./routes/exportRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve static React client build if compiled
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  return sendSuccess(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Student Opportunity AI Full-Stack Platform',
    version: '1.0.0',
    storageMode: env.SUPABASE_URL ? 'supabase-connected' : 'local-resilient-mode',
    aiStatus: env.GEMINI_API_KEY ? 'gemini-enabled' : 'grounded-heuristic-mode'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/my-opportunities', trackerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', exportRoutes);

// Catch-all route to serve React app index.html for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
