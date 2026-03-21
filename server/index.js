import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

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

// Route stubs — will be mounted in Phase 2
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/requests', requestRoutes);
// app.use('/api/datasets', datasetRoutes);
// app.use('/api/contacts', contactRoutes);
// app.use('/api/permits', permitRoutes);
// app.use('/api/research', researchRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/admin', adminRoutes);

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
