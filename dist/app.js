"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const http_1 = require("http");
const https_1 = require("https");
const config_1 = require("./config");
const errorHandler_1 = require("./shared/middleware/errorHandler");
const logger_1 = require("./shared/utils/logger");
const connection_1 = require("./shared/database/connection");
const setup_1 = require("./shared/swagger/setup");
const httpStatus_1 = require("./shared/constants/httpStatus");
const SocketService_1 = require("./services/socket/SocketService");
const socketManager_1 = require("./services/socket/socketManager");
const search_1 = require("./services/search");
const reindex_service_1 = __importDefault(require("./services/search/reindex.service"));
// Import routes
const auth_1 = require("./routes/auth");
const users_1 = require("./routes/users");
const posts_1 = __importDefault(require("./routes/posts"));
const comments_1 = __importDefault(require("./routes/comments"));
const upload_1 = require("./routes/upload");
const chat_1 = require("./routes/chat");
const app = (0, express_1.default)();
// Middleware
// Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // tắt CSP để Swagger UI load được JS/CSS
}));
// CORS: use a dynamic origin allowlist driven by environment variable
// If ALLOWED_ORIGINS is empty, default to allowing same-origin and server-to-server calls.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const corsOptions = {
    origin: (origin, callback) => {
        // No origin means server-to-server or curl/postman — allow it
        if (!origin)
            return callback(null, true);
        // If no explicit allowed origins configured, allow the requesting origin
        if (allowedOrigins.length === 0)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy: This origin is not allowed'), false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};
app.use((0, cors_1.default)(corsOptions));
// Ensure preflight requests are handled without registering a '*' route
// (some router/path-to-regexp versions error when registering '*' directly)
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        // run CORS middleware for this preflight request
        return (0, cors_1.default)(corsOptions)(req, res, next);
    }
    next();
});
// Small debug logging for origin detection (keep quiet in production)
app.use((req, res, next) => {
    if (config_1.config.NODE_ENV !== 'production') {
        logger_1.logger.info(`CORS check - origin: ${req.headers.origin || 'none'} method: ${req.method} path: ${req.originalUrl}`);
    }
    next();
});
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Basic health check - always responds (for Render port detection)
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'dacn-fresh-food-platform',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: config_1.config.NODE_ENV,
        port: config_1.config.PORT
    });
});
// Database health check
app.get('/health/db', (req, res) => {
    const dbReady = connection_1.database.isConnectionReady();
    res.status(dbReady ? httpStatus_1.HttpStatus.OK : httpStatus_1.HttpStatus.SERVICE_UNAVAILABLE).json({
        status: dbReady ? 'OK' : 'DB_NOT_READY',
        database: dbReady ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});
// Serve static files (uploads)
app.use('/uploads', express_1.default.static('uploads'));
// API Routes
app.use('/api/auth', auth_1.authRoutes);
app.use('/api/users', users_1.userRoutes);
app.use('/api/posts', posts_1.default);
app.use('/api/comments', comments_1.default);
app.use('/api/upload', upload_1.uploadRoutes);
app.use('/api/chat', chat_1.chatRoutes);
// Setup Swagger documentation TRƯỚC khi định nghĩa 404 handler
(0, setup_1.setupSwagger)(app);
// API documentation
app.get('/api', (req, res) => {
    res.json({
        message: '🌱 Fresh Food Platform API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            health: '/health'
        },
        documentation: '/api/docs'
    });
});
// Error handling
app.use(errorHandler_1.errorHandler);
app.use((req, res) => {
    res.status(httpStatus_1.HttpStatus.NOT_FOUND).json({
        error: 'Endpoint không tìm thấy',
        message: `${req.method} ${req.originalUrl} không tồn tại`
    });
});
const PORT = config_1.config.PORT || 3000;
// Helper function to get local IP
function getLocalIp() {
    const interfaces = os_1.default.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        if (!iface)
            continue;
        for (const config of iface) {
            if (config.family === 'IPv4' && !config.internal) {
                return config.address;
            }
        }
    }
    return 'localhost';
}
// Start server - bind port FIRST, then connect DB in background
async function startServer() {
    const localIp = getLocalIp();
    let protocol = 'http';
    let server;
    try {
        // Create HTTP/HTTPS server
        if (config_1.config.SSL_KEY_PATH && config_1.config.SSL_CERT_PATH) {
            try {
                const sslOptions = {
                    key: fs_1.default.readFileSync(config_1.config.SSL_KEY_PATH),
                    cert: fs_1.default.readFileSync(config_1.config.SSL_CERT_PATH)
                };
                if (config_1.config.SSL_CA_PATH) {
                    sslOptions.ca = fs_1.default.readFileSync(config_1.config.SSL_CA_PATH);
                }
                server = (0, https_1.createServer)(sslOptions, app);
                protocol = 'https';
            }
            catch (error) {
                logger_1.logger.error('⚠️  Không thể tải SSL certificate. Chuyển sang HTTP.', error);
                server = (0, http_1.createServer)(app);
            }
        }
        else {
            server = (0, http_1.createServer)(app);
        }
        // Initialize Socket.IO
        const socketService = new SocketService_1.SocketService(server);
        (0, socketManager_1.setIO)(socketService.getIO());
        // CRITICAL: Start listening IMMEDIATELY so Render detects the port
        server.listen(PORT, '0.0.0.0', () => {
            logger_1.logger.info(`🚀 Fresh Food Platform API đang chạy tại ${protocol}://${localIp}:${PORT}`);
            logger_1.logger.info(`📊 Health check: ${protocol}://${localIp}:${PORT}/health`);
            logger_1.logger.info(`📖 API docs: ${protocol}://${localIp}:${PORT}/api`);
            logger_1.logger.info(`📚 Swagger docs: ${protocol}://${localIp}:${PORT}/api/docs`);
            logger_1.logger.info(`💬 Socket.IO ready for realtime chat`);
        });
        // Connect to MongoDB in background (non-blocking)
        connection_1.database.connect().then(() => {
            logger_1.logger.info('✅ MongoDB connected successfully');
        }).catch((error) => {
            logger_1.logger.error('❌ MongoDB connection failed:', error);
            logger_1.logger.warn('⚠️  Server is running but database features will not work');
        });
        // Initialize Elasticsearch connection in background for visibility
        if (search_1.elasticsearchService.isEnabled()) {
            search_1.elasticsearchService.initialize()
                .then(() => {
                logger_1.logger.info('✅ Elasticsearch connected successfully');
                // Run reindex check in background: only index collections that are missing docs in ES
                reindex_service_1.default.reindexIfNeeded()
                    .then(() => logger_1.logger.info('✅ Elasticsearch reindex check complete'))
                    .catch(err => logger_1.logger.error('❌ Elasticsearch reindex failed:', err));
            })
                .catch((error) => {
                logger_1.logger.error('❌ Elasticsearch connection failedw31333333333333333333333:', error);
                logger_1.logger.warn('⚠️  Search features will fall back to MongoDB queries');
            });
        }
        else {
            logger_1.logger.warn('⚠️  Elasticsearch is not configured. Advanced search features are disabled.');
        }
    }
    catch (error) {
        logger_1.logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
