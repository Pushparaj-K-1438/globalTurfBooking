import Booking from "../../models/booking";
import Listing from "../../models/Listing";
import Review from "../../models/Review";
import mongoose from "mongoose";

export async function getTenantAnalytics(tenantId, period = 30) {
    const tId = new mongoose.Types.ObjectId(tenantId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Basic stats
    const stats = await Booking.aggregate([
        { $match: { tenantId: tId } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$finalAmount" },
                totalBookings: { $count: {} },
                avgBookingValue: { $avg: "$finalAmount" },
            },
        },
    ]);

    // Period revenue
    const periodStats = await Booking.aggregate([
        { $match: { tenantId: tId, createdAt: { $gte: startDate }, status: { $in: ['confirmed', 'completed'] } } },
        {
            $group: {
                _id: null,
                periodRevenue: { $sum: "$finalAmount" },
                periodBookings: { $count: {} },
            },
        },
    ]);

    // Bookings by status
    const bookingsByStatus = await Booking.aggregate([
        { $match: { tenantId: tId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Daily revenue for charts
    const dailyRevenue = await Booking.aggregate([
        {
            $match: {
                tenantId: tId,
                createdAt: { $gte: startDate },
                status: { $in: ['confirmed', 'completed'] }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                revenue: { $sum: "$finalAmount" },
                bookings: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Top listings
    const listingStats = await Booking.aggregate([
        { $match: { tenantId: tId, status: { $in: ['confirmed', 'completed'] } } },
        {
            $group: {
                _id: "$listingId",
                count: { $sum: 1 },
                revenue: { $sum: "$finalAmount" },
            },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "listings",
                localField: "_id",
                foreignField: "_id",
                as: "listing",
            },
        },
        { $unwind: "$listing" },
        { $project: { title: "$listing.title", count: 1, revenue: 1 } }
    ]);

    // Review stats
    const reviewStats = await Review.aggregate([
        { $match: { tenantId: tId, status: 'approved' } },
        {
            $group: {
                _id: null,
                avgRating: { $avg: "$overallRating" },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    // Counts
    const counts = {
        totalListings: await Listing.countDocuments({ tenantId: tId, isActive: true }),
        pendingBookings: await Booking.countDocuments({ tenantId: tId, status: 'pending' }),
        completedBookings: await Booking.countDocuments({ tenantId: tId, status: 'completed' }),
        cancelledBookings: await Booking.countDocuments({ tenantId: tId, status: 'cancelled' }),
        pendingReviews: await Review.countDocuments({ tenantId: tId, status: 'pending' }),
    };

    return {
        overview: {
            ...(stats[0] || { totalRevenue: 0, totalBookings: 0, avgBookingValue: 0 }),
            ...(periodStats[0] || { periodRevenue: 0, periodBookings: 0 }),
            ...counts,
        },
        topListings: listingStats,
        bookingsByStatus,
        dailyRevenue,
        reviewStats: reviewStats[0] || { avgRating: 0, totalReviews: 0 },
    };
}

export async function getGlobalAnalytics() {
    const stats = await Booking.aggregate([
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$finalAmount" },
                totalBookings: { $count: {} },
                totalTenants: { $addToSet: "$tenantId" },
            },
        },
        {
            $project: {
                totalRevenue: 1,
                totalBookings: 1,
                tenantCount: { $size: "$totalTenants" },
            },
        },
    ]);

    // Revenue by tenant
    const revenueByTenant = await Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: "$tenantId", revenue: { $sum: "$finalAmount" }, bookings: { $sum: 1 } } },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        { $lookup: { from: "tenants", localField: "_id", foreignField: "_id", as: "tenant" } },
        { $unwind: "$tenant" },
        { $project: { name: "$tenant.name", revenue: 1, bookings: 1 } }
    ]);

    // Monthly revenue trend
    const monthlyRevenue = await Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                revenue: { $sum: "$finalAmount" },
                bookings: { $sum: 1 }
            }
        },
        { $sort: { _id: -1 } },
        { $limit: 12 }
    ]);

    return {
        ...(stats[0] || { totalRevenue: 0, totalBookings: 0, tenantCount: 0 }),
        topTenants: revenueByTenant,
        monthlyRevenue: monthlyRevenue.reverse(),
    };
}
