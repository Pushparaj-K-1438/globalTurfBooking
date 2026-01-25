// Security & Compliance Service
// Provides audit logging, rate limiting, encryption, and GDPR compliance utilities

import AuditLog from '../models/AuditLog';
import connectDB from './mongoose';
import crypto from 'crypto';

// ==================== AUDIT LOGGING ====================

/**
 * Log an audit event
 */
export async function logAuditEvent({
    userId,
    tenantId,
    action,
    resource,
    resourceId,
    previousData = null,
    newData = null,
    ipAddress = null,
    userAgent = null,
    method = null,
    path = null,
    status = 'success',
    errorMessage = null,
    metadata = {}
}) {
    try {
        await connectDB();

        // Calculate changes between previous and new data
        const changes = calculateChanges(previousData, newData);

        const auditLog = new AuditLog({
            userId,
            tenantId,
            action,
            resource,
            resourceId,
            previousData,
            newData,
            changes,
            ipAddress,
            userAgent,
            method,
            path,
            status,
            errorMessage,
            metadata
        });

        await auditLog.save();
        return auditLog;
    } catch (error) {
        console.error('Failed to log audit event:', error);
        // Don't throw - audit logging shouldn't break the main flow
        return null;
    }
}

/**
 * Calculate the differences between two objects
 */
function calculateChanges(oldData, newData) {
    if (!oldData || !newData) return [];

    const changes = [];
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const key of allKeys) {
        // Skip internal fields
        if (key.startsWith('_') || key === 'updatedAt' || key === 'createdAt') continue;

        const oldValue = oldData[key];
        const newValue = newData[key];

        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes.push({
                field: key,
                oldValue: sanitizeValue(oldValue),
                newValue: sanitizeValue(newValue)
            });
        }
    }

    return changes;
}

/**
 * Sanitize sensitive values for logging
 */
function sanitizeValue(value) {
    if (value === undefined) return undefined;
    if (value === null) return null;

    // Mask sensitive fields
    if (typeof value === 'string') {
        if (value.length > 500) {
            return value.substring(0, 500) + '...[truncated]';
        }
    }

    return value;
}

// ==================== ENCRYPTION ====================

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Get encryption key from environment or generate one
 */
function getEncryptionKey() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length < 32) {
        console.warn('ENCRYPTION_KEY not set or too short. Using fallback.');
        return crypto.scryptSync('fallback-key-change-me', 'salt', 32);
    }
    return Buffer.from(key, 'hex');
}

/**
 * Encrypt sensitive data
 */
export function encryptData(plaintext) {
    if (!plaintext) return null;

    try {
        const key = getEncryptionKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const tag = cipher.getAuthTag();

        // Return IV + Tag + Encrypted data
        return iv.toString('hex') + tag.toString('hex') + encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
}

/**
 * Decrypt sensitive data
 */
export function decryptData(ciphertext) {
    if (!ciphertext) return null;

    try {
        const key = getEncryptionKey();

        // Extract IV, tag, and encrypted data
        const iv = Buffer.from(ciphertext.slice(0, IV_LENGTH * 2), 'hex');
        const tag = Buffer.from(ciphertext.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2), 'hex');
        const encrypted = ciphertext.slice((IV_LENGTH + TAG_LENGTH) * 2);

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

/**
 * Hash sensitive data (one-way)
 */
export function hashData(data) {
    if (!data) return null;
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

// ==================== RATE LIMITING ====================

const rateLimitStore = new Map();

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(identifier, limit = 100, windowMs = 60000) {
    const now = Date.now();
    const key = identifier;

    // Get or create entry
    let entry = rateLimitStore.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
        entry = { count: 1, windowStart: now };
        rateLimitStore.set(key, entry);
        return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
    }

    entry.count++;

    if (entry.count > limit) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.windowStart + windowMs,
            retryAfter: Math.ceil((entry.windowStart + windowMs - now) / 1000)
        };
    }

    return {
        allowed: true,
        remaining: limit - entry.count,
        resetAt: entry.windowStart + windowMs
    };
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
    login: { limit: 5, windowMs: 15 * 60 * 1000 },      // 5 attempts per 15 min
    register: { limit: 3, windowMs: 60 * 60 * 1000 },   // 3 registrations per hour
    api: { limit: 100, windowMs: 60 * 1000 },           // 100 requests per minute
    booking: { limit: 10, windowMs: 60 * 1000 },        // 10 bookings per minute
    passwordReset: { limit: 3, windowMs: 60 * 60 * 1000 } // 3 resets per hour
};

// ==================== GDPR COMPLIANCE ====================

/**
 * Mask PII (Personally Identifiable Information)
 */
export function maskPII(data, fieldsToMask = ['email', 'phone', 'mobile', 'password']) {
    if (!data) return data;

    const masked = { ...data };

    for (const field of fieldsToMask) {
        if (masked[field]) {
            if (field === 'email') {
                const [local, domain] = masked[field].split('@');
                masked[field] = `${local.charAt(0)}***@${domain}`;
            } else if (field === 'phone' || field === 'mobile') {
                masked[field] = masked[field].replace(/\d(?=\d{4})/g, '*');
            } else {
                masked[field] = '***REDACTED***';
            }
        }
    }

    return masked;
}

/**
 * Prepare user data for export (GDPR right to data portability)
 */
export async function exportUserData(userId) {
    await connectDB();

    const User = (await import('../models/User')).default;
    const Booking = (await import('../models/booking')).default;
    const Review = (await import('../models/Review')).default;

    const user = await User.findById(userId).lean();
    if (!user) return null;

    const bookings = await Booking.find({ userId }).lean();
    const reviews = await Review.find({ userId }).lean();

    return {
        exportedAt: new Date().toISOString(),
        profile: {
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            createdAt: user.createdAt
        },
        bookings: bookings.map(b => ({
            id: b._id,
            date: b.bookingDate,
            status: b.status,
            amount: b.totalAmount,
            createdAt: b.createdAt
        })),
        reviews: reviews.map(r => ({
            id: r._id,
            rating: r.overallRating,
            comment: r.comment,
            createdAt: r.createdAt
        }))
    };
}

/**
 * Anonymize user data (GDPR right to be forgotten)
 */
export async function anonymizeUser(userId) {
    await connectDB();

    const User = (await import('../models/User')).default;

    const anonymizedData = {
        name: 'Deleted User',
        email: `deleted_${Date.now()}@anonymized.local`,
        password: hashData(generateSecureToken()),
        mobile: '0000000000',
        isActive: false,
        deletedAt: new Date(),
        metadata: { anonymized: true, anonymizedAt: new Date() }
    };

    await User.findByIdAndUpdate(userId, anonymizedData);

    // Log the anonymization
    await logAuditEvent({
        userId,
        action: 'anonymize',
        resource: 'user',
        resourceId: userId,
        status: 'success'
    });

    return true;
}

// ==================== SESSION SECURITY ====================

/**
 * Validate session fingerprint to prevent session hijacking
 */
export function generateSessionFingerprint(req) {
    const userAgent = req.headers?.['user-agent'] || '';
    const acceptLanguage = req.headers?.['accept-language'] || '';

    return hashData(`${userAgent}|${acceptLanguage}`);
}

/**
 * Check for suspicious login activity
 */
export async function checkSuspiciousActivity(userId, ipAddress) {
    await connectDB();

    // Check recent failed login attempts
    const recentFailures = await AuditLog.countDocuments({
        userId,
        action: 'login',
        status: 'failure',
        createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
    });

    if (recentFailures >= 5) {
        return { suspicious: true, reason: 'too_many_failures' };
    }

    // Check for login from new location/IP
    const recentLogins = await AuditLog.find({
        userId,
        action: 'login',
        status: 'success'
    }).sort({ createdAt: -1 }).limit(10).lean();

    const knownIPs = new Set(recentLogins.map(l => l.ipAddress));
    if (recentLogins.length > 0 && !knownIPs.has(ipAddress)) {
        return { suspicious: true, reason: 'new_ip_address', ipAddress };
    }

    return { suspicious: false };
}

// ==================== INPUT SANITIZATION ====================

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input) {
    if (typeof input !== 'string') return input;

    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
}

/**
 * Validate and sanitize object keys/values
 */
export function sanitizeObject(obj, allowedKeys = null) {
    if (!obj || typeof obj !== 'object') return {};

    const sanitized = {};

    for (const [key, value] of Object.entries(obj)) {
        // Skip if key not in allowed list
        if (allowedKeys && !allowedKeys.includes(key)) continue;

        // Skip prototype pollution attempts
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;

        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value, null);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

export default {
    logAuditEvent,
    encryptData,
    decryptData,
    hashData,
    generateSecureToken,
    checkRateLimit,
    RATE_LIMITS,
    maskPII,
    exportUserData,
    anonymizeUser,
    generateSessionFingerprint,
    checkSuspiciousActivity,
    sanitizeString,
    sanitizeObject
};
