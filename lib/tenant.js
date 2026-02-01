import connectDB from "./mongoose";
import Tenant from "../models/Tenant";
import { headers } from "next/headers";

/**
 * Resolves the tenant from the request headers or host.
 * This can be used in Server Components and API Routes.
 */
export async function getTenant() {
    await connectDB();
    const headerList = await headers();
    const host = headerList.get("host");
    const tenantIdHeader = headerList.get("x-tenant-id");

    console.log(`[getTenant] Host: ${host}, Cookie: ${headerList.get("cookie")}`);

    // console.log(`[getTenant] Host: ${host}, Header: ${tenantIdHeader}`);

    // 1. Check for manual header (useful for API testing/mobile apps)
    if (tenantIdHeader) {
        const tenant = await Tenant.findById(tenantIdHeader);
        if (tenant) return tenant;
    }

    // 2. Check for subdomain
    // Example: tenant1.localhost:3000 -> slug is 'tenant1'
    const domainParts = host.split(".");
    if (domainParts.length > (host.includes("localhost") ? 1 : 2)) {
        const slug = domainParts[0];
        const tenant = await Tenant.findOne({ slug });
        if (tenant) return tenant;
        console.log(`[getTenant] No tenant found for slug: ${slug}`);
    }

    // 3. Fallback: Check Referer (useful for local development on /v/[slug] routes)
    const referer = headerList.get("referer");
    if (referer && referer.includes("/v/")) {
        const url = new URL(referer);
        const pathParts = url.pathname.split("/");
        const slugIndex = pathParts.indexOf("v") + 1;
        if (slugIndex > 0 && pathParts[slugIndex]) {
            const slug = pathParts[slugIndex];
            const tenant = await Tenant.findOne({ slug });
            if (tenant) return tenant;
            console.log(`[getTenant] No tenant found for referer slug: ${slug}`);
        }
    }

    // 4. Fallback to session if available (for authenticated routes)
    try {
        const { verifySession } = await import("./session");
        const session = await verifySession();
        console.log(`[getTenant] Session found:`, session ? "Yes" : "No", "TenantID:", session?.tenantId);

        if (session?.tenantId) {
            try {
                const tenant = await Tenant.findById(session.tenantId);
                if (tenant) return tenant;
                console.warn(`[getTenant] Session has tenantId ${session.tenantId} but tenant not found in DB`);
            } catch (dbError) {
                console.error(`[getTenant] DB Error resolving tenant: ${dbError.message}`);
            }
        } else {
            console.warn("[getTenant] No tenantId in session");
        }
    } catch (e) {
        console.error("[getTenant] Session fallback error:", e);
    }

    return null;
}

/**
 * Middleware style check to ensure a tenant is present and active.
 */
export async function validateTenant(tenant) {
    if (!tenant) {
        throw new Error("Tenant not found or invalid domain.");
    }
    if (tenant.status !== "active") {
        throw new Error(`Tenant is ${tenant.status}.`);
    }
    return true;
}

export async function getTenantById(id) {
    try {
        const tenant = await Tenant.findById(id);
        return tenant;
    } catch (e) {
        console.error("Failed to get tenant by ID", e);
        return null;
    }
}
