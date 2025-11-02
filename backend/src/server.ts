import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config';
import connectDatabase from './config/database';
import { EmailUtil } from './utils';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import timesheetRoutes from './routes/timesheet.routes';
import leaveRoutes from './routes/leave.routes';
import documentRoutes from './routes/document.routes';
import reportRoutes from './routes/report.routes';
import notificationRoutes from './routes/notification.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app: Application = express();

// ==================== MIDDLEWARE ====================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.frontend.url,
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ==================== DATABASE CONNECTION ====================

connectDatabase();

// Initialize email utility
EmailUtil.initialize();

// ==================== ROUTES ====================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Employee Portal API is running',
    timestamp: new Date().toISOString(),
    environment: config.env
  });
});

// API Routes
const apiPrefix = config.apiPrefix;

// Mount routes
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/timesheets`, timesheetRoutes);
app.use(`${apiPrefix}/leaves`, leaveRoutes);
app.use(`${apiPrefix}/documents`, documentRoutes);
app.use(`${apiPrefix}/reports`, reportRoutes);
app.use(`${apiPrefix}/notifications`, notificationRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: Object.values(err.errors).map((e: any) => e.message)
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      status: 'error',
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
  }

  // Default error
  return res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(config.env === 'development' && { stack: err.stack })
  });
});

// ==================== SERVER START ====================

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${config.env}`);
  console.log(`📡 API Endpoint: http://localhost:${PORT}${apiPrefix}`);
  console.log(`📧 Email: ${config.email.user ? 'Configured' : 'Not configured'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});

export default app;
