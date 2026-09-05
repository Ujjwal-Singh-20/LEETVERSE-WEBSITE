import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { ENV, getAllowedOrigins } from './config/env';
import { appRouter } from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { ERROR_CODES } from './constants/errorCodes';

const app = express();

// 1. Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. CORS Configuration
// TODO (Deployment): On Render / production, set FRONTEND_URL in the dashboard environment variables
// to strictly match your production frontend URL (e.g. "https://leetverse.vercel.app").
// Never set FRONTEND_URL to "*" in production.
const allowedOrigins = getAllowedOrigins();
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, keep-alive)
      if (!origin) return callback(null, true);

      // In development / non-production, allow any localhost or 127.0.0.1 origin
      if (
        ENV.NODE_ENV !== 'production' &&
        (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin))
      ) {
        return callback(null, true);
      }

      // In production, block any wildcard origins
      if (allowedOrigins.includes('*') && ENV.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: Origin '${origin}' is not authorized to access LeetVerse API.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Lightweight Keep-Alive Health Route (for cron-job.org / Render ping)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'leetverse-api',
  });
});

// Root endpoint handler
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to the LeetVerse API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      public: {
        businessCard: '/u/:username',
        galleryImages: '/api/gallery/:slug/images',
        projects: '/api/projects',
        gallery: '/api/gallery',
        members: '/api/members',
      }
    },
  });
});

// 5. Mount API Routes
app.use(appRouter);

// 6. 404 Fallback Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: ERROR_CODES.NOT_FOUND,
      message: `The requested endpoint '${req.method} ${req.originalUrl}' does not exist.`,
    },
  });
});

// 7. Global Error Handler
app.use(errorHandler);

// 8. Start Server
const PORT = ENV.PORT;
const server = app.listen(PORT, () => {
  console.log(`⚡ [LeetVerse Backend] Server is running on port ${PORT} in ${ENV.NODE_ENV} mode.`);
  console.log(`🌐 Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
