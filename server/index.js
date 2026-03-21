import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import requestRoutes from './src/routes/request.routes.js';
import datasetRoutes from './src/routes/dataset.routes.js';
import contactRoutes from './src/routes/contact.routes.js';
import permitRoutes from './src/routes/permit.routes.js';
import researchRoutes from './src/routes/research.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import adminRoutes from './src/routes/admin.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

// Security headers
app.use(helmet());

// CORS — allow only CLIENT_URL origin
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parser with 10mb limit
app.use(express.json({ limit: '10mb' }));

// Global rate limit: 200 requests per 15 minutes per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// Health check — no auth required
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Google OAuth callback for Sheets import
import { getAuthUrl, getTokensFromCode } from './src/services/googlesheets.service.js';

app.get('/auth/google/sheets-auth', (req, res) => {
  try {
    const state = req.query.dataset_id || '';
    const url = getAuthUrl(state);
    return res.json({ url });
  } catch (err) {
    log(`sheets-auth error: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) return res.status(400).send('Missing authorization code');

    const tokens = await getTokensFromCode(code);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const redirectUrl = state
      ? `${clientUrl}/datasets/${state}?google_token=${encodeURIComponent(tokens.access_token)}`
      : `${clientUrl}?google_token=${encodeURIComponent(tokens.access_token)}`;

    return res.redirect(redirectUrl);
  } catch (err) {
    log(`google callback error: ${err.message}`);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}?error=google_auth_failed`);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/permits', permitRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, _next) => {
  log(`ERROR: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  log(`SPARKS DataLab server running on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  log(`UNCAUGHT EXCEPTION: ${err.message}`);
  log(err.stack);
});

process.on('unhandledRejection', (reason) => {
  log(`UNHANDLED REJECTION: ${reason}`);
});

export default app;
