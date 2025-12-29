"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.query = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../utils/logger");
dotenv_1.default.config();
const poolConfig = {
    connectionString: process.env.DATABASE_URL || 'postgresql://studycollab:studycollab@localhost:5432/studycollab',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};
const pool = new pg_1.Pool(poolConfig);
// Test connection
pool.on('connect', () => {
    (0, logger_1.logInfo)('Database connected');
});
pool.on('error', (err) => {
    (0, logger_1.logError)(err, { context: 'Database pool error' });
    process.exit(-1);
});
// Helper function to execute queries
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        (0, logger_1.logQuery)(text, params, duration);
        return res;
    }
    catch (error) {
        (0, logger_1.logQuery)(text, params, Date.now() - start, error);
        throw error;
    }
};
exports.query = query;
// Helper function to get a client from the pool
const getClient = () => {
    return pool.connect();
};
exports.getClient = getClient;
exports.default = pool;
