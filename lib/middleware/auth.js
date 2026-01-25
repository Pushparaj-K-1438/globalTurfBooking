import { jwtVerify } from "jose";
import { headers } from "next/headers";
import User from "../../models/User";
import { getTenant } from "../tenant";
import { verifySession } from "../session";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");

export async function authMiddleware(req) {
    try {
        let userId = null;
        let userRole = null;

        // 1. Try Bearer Token
        const authHeader = (await headers()).get("authorization");
        if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const { payload } = await jwtVerify(token, JWT_SECRET);
            userId = payload.userId;
            userRole = payload.role;
        }
        // 2. Try Session Cookie
        else {
            const session = await verifySession(req);
            if (session) {
                userId = session.userId;
                userRole = session.role;
            }
        }

        if (!userId) {
            return { error: "Unauthorized", status: 401 };
        }

        const user = await User.findById(userId);
        if (!user || !user.isActive) {
            return { error: "User not found or inactive", status: 401 };
        }

        // Role-based tenant check
        const tenant = await getTenant();
        if (user.role !== "SUPER_ADMIN" && (!tenant || user.tenantId.toString() !== tenant._id.toString())) {
            return { error: "Access denied. Tenant mismatch.", status: 403 };
        }

        return { user, tenant };
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return { error: "Invalid token or session", status: 401 };
    }
}

export function authorize(...roles) {
    return async (user) => {
        if (!roles.includes(user.role)) {
            return { error: "Forbidden", status: 403 };
        }
        return null;
    };
}
