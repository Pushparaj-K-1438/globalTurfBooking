import { NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITS, logAuditEvent } from "../../lib/security";

/**
 * Rate limiting middleware for API routes
 * Usage: wrap your route handler with this function
 */
export function withRateLimit(handler, limitType = 'api') {
    return async (req, ...args) => {
        const config = RATE_LIMITS[limitType] || RATE_LIMITS.api;

        // Get identifier (IP or user ID)
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
            req.headers.get('x-real-ip') ||
            'unknown';

        const identifier = `${limitType}:${ip}`;
        const result = checkRateLimit(identifier, config.limit, config.windowMs);

        if (!result.allowed) {
            // Log rate limit exceeded
            await logAuditEvent({
                action: 'rate_limit_exceeded',
                resource: limitType,
                ipAddress: ip,
                status: 'failure',
                metadata: { retryAfter: result.retryAfter }
            });

            return NextResponse.json(
                {
                    error: "Too many requests",
                    message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
                    retryAfter: result.retryAfter
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(result.retryAfter),
                        'X-RateLimit-Limit': String(config.limit),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(result.resetAt)
                    }
                }
            );
        }

        // Add rate limit headers to response
        const response = await handler(req, ...args);

        if (response instanceof NextResponse) {
            response.headers.set('X-RateLimit-Limit', String(config.limit));
            response.headers.set('X-RateLimit-Remaining', String(result.remaining));
            response.headers.set('X-RateLimit-Reset', String(result.resetAt));
        }

        return response;
    };
}

/**
 * CSRF protection middleware
 */
export function withCSRF(handler) {
    return async (req, ...args) => {
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            const csrfToken = req.headers.get('x-csrf-token');
            const cookieToken = req.cookies.get('csrf_token')?.value;

            if (!csrfToken || csrfToken !== cookieToken) {
                return NextResponse.json(
                    { error: "Invalid CSRF token" },
                    { status: 403 }
                );
            }
        }

        return handler(req, ...args);
    };
}

/**
 * Security headers middleware
 */
export function withSecurityHeaders(response) {
    const headers = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    };

    for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
    }

    return response;
}

/**
 * Audit logging middleware
 */
export function withAuditLog(handler, resource) {
    return async (req, ...args) => {
        const startTime = Date.now();
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
        const userAgent = req.headers.get('user-agent') || 'unknown';

        let response;
        let status = 'success';
        let errorMessage = null;

        try {
            response = await handler(req, ...args);

            if (response.status >= 400) {
                status = 'failure';
                try {
                    const body = await response.clone().json();
                    errorMessage = body.error || body.message;
                } catch { }
            }
        } catch (error) {
            status = 'failure';
            errorMessage = error.message;
            throw error;
        } finally {
            // Log the request
            await logAuditEvent({
                action: req.method.toLowerCase(),
                resource,
                ipAddress: ip,
                userAgent,
                method: req.method,
                path: new URL(req.url).pathname,
                status,
                errorMessage,
                metadata: { duration: Date.now() - startTime }
            });
        }

        return response;
    };
}
