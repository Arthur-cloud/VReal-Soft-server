/**
 * Application-wide constants
 */

// JWT Configuration
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
} as const;

// File Upload Configuration
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB in bytes
  MAX_SIZE_BYTES: 100 * 1024 * 1024, // 100MB in bytes
  MAX_SIZE_MB: 100, // 100MB
  UPLOAD_DIR: './uploads',
  ALLOWED_MIME_TYPES: [] as string[], // Empty array means all types allowed
} as const;

// Database Configuration
export const DATABASE_CONFIG = {
  SYNCHRONIZE: process.env['NODE_ENV'] !== 'production',
  LOGGING: process.env['NODE_ENV'] === 'development',
} as const;

// API Configuration
export const API_CONFIG = {
  PREFIX: 'api',
  VERSION: '1.0',
  TITLE: 'VReal File Storage API',
  DESCRIPTION:
    'Backend API for file storage system with hierarchical folders, permissions, and real-time synchronization',
} as const;

// WebSocket Configuration
export const WS_CONFIG = {
  CORS: {
    origin: process.env['CLIENT_URL'] || 'http://localhost:5173',
    credentials: true,
  },
} as const;

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
} as const;
