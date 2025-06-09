"use strict";
// backend/src/utils/jwt.ts
// JWT utilities for authentication
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.verifyJwt = exports.generateJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("./logger");
/**
 * Generate a JWT token
 */
const generateJwt = (payload, expiresIn = '1d') => {
    return new Promise((resolve, reject) => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            logger_1.logger.error('JWT_SECRET is not defined in environment variables');
            reject(new Error('JWT configuration error'));
            return;
        }
        try {
            const options = {
                expiresIn: expiresIn
            };
            const token = jsonwebtoken_1.default.sign(payload, secret, options);
            resolve(token);
        }
        catch (err) {
            logger_1.logger.error('JWT generation error:', err);
            reject(err);
        }
    });
};
exports.generateJwt = generateJwt;
/**
 * Verify a JWT token
 */
const verifyJwt = (token) => {
    return new Promise((resolve) => {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            logger_1.logger.error('JWT_SECRET is not defined in environment variables');
            resolve(null);
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            resolve(decoded);
        }
        catch (err) {
            logger_1.logger.warn('JWT verification failed:', err);
            resolve(null);
        }
    });
};
exports.verifyJwt = verifyJwt;
/**
 * Generate a refresh token
 */
const generateRefreshToken = (userId) => {
    return new Promise((resolve, reject) => {
        const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
        if (!secret) {
            logger_1.logger.error('REFRESH_TOKEN_SECRET is not defined in environment variables');
            reject(new Error('JWT configuration error'));
            return;
        }
        try {
            const options = {
                expiresIn: '30d'
            };
            const token = jsonwebtoken_1.default.sign({ id: userId }, secret, options);
            resolve(token);
        }
        catch (err) {
            logger_1.logger.error('Refresh token generation error:', err);
            reject(err);
        }
    });
};
exports.generateRefreshToken = generateRefreshToken;
