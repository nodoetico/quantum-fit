import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import pino from 'pino';
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import http from 'http';
import { connectDatabase } from './database';

import authRoutes from './routes/auth.routes';
import checkinsRoutes from './routes/checkins.routes';
import activityLogRoutes from './routes/activity-log.routes';
import achievementsRoutes from './routes/achievements.routes';
import rewardsRoutes from './routes/rewards.routes';
import landingRoutes from './routes/landing.routes';
import adminBookingsRoutes from './routes/admin/bookings.routes';
import adminClassesRoutes from './routes/admin/classes.routes';
import adminRewardsRoutes from './routes/admin/rewards.routes';
import adminIntegrationRoutes from './routes/admin/integration.routes';
import externalSyncRoutes from './routes/external-sync.routes';
import externalPullRoutes from './routes/external-pull.routes';
import * as weeklyStatsController from './controllers/weekly-stats.controller';
import rankingRoutes from './routes/ranking.routes';
import classesRoutes from './routes/classes.routes';
import bookingsRoutes from './routes/bookings.routes';
import paymentRoutes from './routes/payment.routes';
import referralRoutes from './routes/referral.routes';
import mercadopagoRoutes from './routes/mercadopago.routes';

import { errorHandler, notFoundHandler } from './middleware/error';
import { authenticate } from './middleware/auth';
import { setSocketIO } from './services/notification.service';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// === PROCESO: handlers para caídas no capturadas ===
process.on('unhandledRejection', (reason: Error | any) => {
  console.error('UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

// === LOGGING ===
const logger = pino({
  level: isProduction ? 'info' : 'debug',
  transport: isProduction ? undefined : { target: 'pino-pretty' },
});

app.use(pinoHttp({ logger }));
app.use(morgan(isProduction ? 'combined' : 'dev'));

// === SEGURIDAD ===
app.use(helmet());

const allowedOriginsStr = process.env.ALLOWED_ORIGINS;
if (!allowedOriginsStr) {
  logger.error('CORS: ALLOWED_ORIGINS no configurado. Fallando por seguridad.');
  process.exit(1);
}

const allowedOrigins = allowedOriginsStr.split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(cookieParser());

// === RATE LIMITING ===
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    error: 'Demasiadas peticiones. Por favor intenta más tarde.',
  },
});
app.use('/api', limiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.',
  },
});
app.use('/api/auth/login', loginLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === HEALTH CHECK ===
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'QUANTUM FIT API is running',
    timestamp: new Date().toISOString(),
  });
});

// === API ROUTES ===
app.use('/api/auth', authRoutes);
app.use('/api/checkins', checkinsRoutes);
app.use('/api/activity-log', activityLogRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/landing', landingRoutes);
app.use('/api/external', externalSyncRoutes);
app.use('/api/external-pull', externalPullRoutes);
app.use('/api/admin/bookings', adminBookingsRoutes);
app.use('/api/admin/classes', adminClassesRoutes);
app.use('/api/admin/rewards', adminRewardsRoutes);
app.use('/api/admin/integration', adminIntegrationRoutes);
app.get('/api/stats/weekly', authenticate, weeklyStatsController.getWeeklyStats);
app.get('/api/stats/weekly/current', authenticate, weeklyStatsController.getCurrentWeekProgress);
app.use('/api/ranking', rankingRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/mercadopago', mercadopagoRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// === SERVER ===
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

setSocketIO(io);

io.on('connection', (socket) => {
  socket.on('join-user', (userId: string) => {
    socket.join(`user:${userId}`);
  });
  socket.on('disconnect', () => {});
});

async function startServer() {
  try {
    await connectDatabase();

    if (isProduction) {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || `http://0.0.0.0:${PORT}`;
      if (apiUrl.startsWith('http://')) {
        logger.warn('HTTPS: La API se sirve sobre HTTP en modo producción. Usar HTTPS en producción.');
      }
    }

    server.listen(Number(PORT), '0.0.0.0');
    logger.info(`QUANTUM FIT API corriendo en puerto ${PORT} (${process.env.NODE_ENV || 'development'})`);
  } catch (error: unknown) {
    logger.error(error instanceof Error ? error.message : 'Error desconocido al iniciar servidor');
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido. Cerrando servidor gracefulmente...');
  server.close(() => {
    process.exit(0);
  });
});

startServer();

export { app, io };
export { notifyUser } from './services/notification.service';
