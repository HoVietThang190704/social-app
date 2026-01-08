"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = exports.DatabaseConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../../config");
const logger_1 = require("../utils/logger");
class DatabaseConnection {
    constructor() {
        this.isConnected = false;
    }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    async connect() {
        try {
            if (this.isConnected) {
                logger_1.logger.info('🔗 MongoDB connection already established');
                return;
            }
            const options = {
                maxPoolSize: 1000,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                family: 4,
                dbName: 'DAChuyenNganh'
            };
            logger_1.logger.info('🔄 Attempting to connect to MongoDB...');
            logger_1.logger.info(`📡 URI: ${config_1.config.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
            await mongoose_1.default.connect(config_1.config.MONGODB_URI, options);
            this.isConnected = true;
            logger_1.logger.info('🚀 Connected to MongoDB successfully');
            logger_1.logger.info(`📊 Database: ${mongoose_1.default.connection.name}`);
            logger_1.logger.info(`🌐 Host: ${mongoose_1.default.connection.host}:${mongoose_1.default.connection.port}`);
        }
        catch (error) {
            logger_1.logger.error('❌ MongoDB connection error:', error);
            this.isConnected = false;
            if (config_1.config.NODE_ENV === 'production') {
                logger_1.logger.error('⚠️  Production: Failed to connect to MongoDB. Check MONGODB_URI env var.');
                logger_1.logger.error('⚠️  Server will continue but database operations will fail.');
                throw error;
            }
            else {
                logger_1.logger.warn('⚠️ Development: Continuing without MongoDB');
                logger_1.logger.warn('🔧 API will work with mock data where possible');
            }
        }
    }
    async disconnect() {
        try {
            if (!this.isConnected) {
                return;
            }
            await mongoose_1.default.disconnect();
            this.isConnected = false;
            logger_1.logger.info('📴 Disconnected from MongoDB');
        }
        catch (error) {
            logger_1.logger.error('❌ Error disconnecting from MongoDB:', error);
        }
    }
    getConnection() {
        return mongoose_1.default.connection;
    }
    isConnectionReady() {
        return this.isConnected && mongoose_1.default.connection.readyState === 1;
    }
}
exports.DatabaseConnection = DatabaseConnection;
// Export singleton instance
exports.database = DatabaseConnection.getInstance();
// Handle connection events
mongoose_1.default.connection.on('connected', () => {
    logger_1.logger.info('🔗 Mongoose connected to MongoDB');
});
mongoose_1.default.connection.on('error', (error) => {
    logger_1.logger.error('❌ Mongoose connection error:', error);
});
mongoose_1.default.connection.on('disconnected', () => {
    logger_1.logger.info('📴 Mongoose disconnected from MongoDB');
});
// Handle process termination
process.on('SIGINT', async () => {
    await exports.database.disconnect();
    process.exit(0);
});
