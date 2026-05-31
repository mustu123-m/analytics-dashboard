require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const migrate = require('./utils/migrate');
const uploadRoutes = require('./routes/upload');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const authRoutes = require('./routes/auth');
const { protect } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws' });
const clients = new Map();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  let userId = null;
  if (token) {
    try { userId = jwt.verify(token, process.env.JWT_SECRET).userId; } catch {}
  }
  const clientId = Date.now().toString();
  clients.set(clientId, { ws, userId });
  ws.send(JSON.stringify({ type: 'connected', clientId }));
  ws.on('close', () => clients.delete(clientId));
  ws.on('error', () => clients.delete(clientId));
});

app.locals.broadcast = (data) => {
  const message = JSON.stringify(data);
  clients.forEach(({ ws }) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(message);
  });
};

// CORS
const allowedOrigins = ['http://localhost:3000', process.env.FRONTEND_URL].filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Uploads dir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Public routes
app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// Protected routes
app.use('/api/upload', protect, uploadRoutes);
app.use('/api/analytics', protect, analyticsRoutes);
app.use('/api/ai', protect, aiRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

// Run DB migrations then start server
migrate()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔌 WebSocket at ws://localhost:${PORT}/ws`);
      console.log(`✅ Allowed origins:`, allowedOrigins);
    });
  })
  .catch(err => {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  });