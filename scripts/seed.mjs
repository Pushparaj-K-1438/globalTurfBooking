// Database Seeding Script
// Run with: node scripts/seed.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

// Import models
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import Listing from '../models/listing.js';
import Booking from '../models/booking.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';
import Slot from '../models/slots.js';
import Notification from '../models/notification.js';
import AuditLog from '../models/AuditLog.js';
import TenantSubscription from '../models/TenantSubscription.js';

async function clearDatabase() {
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Tenant.deleteMany({});
    await Listing.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    await Review.deleteMany({});
    await Coupon.deleteMany({});
    await Slot.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    await TenantSubscription.deleteMany({});
    console.log('✅ Database cleared!');
}

async function seedDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('📦 Connected to MongoDB');

        await clearDatabase();

        // Hash password
        const hashedPassword = await bcrypt.hash('Password123!', 10);

        // ==================== 1. SUPER ADMIN ====================
        console.log('👤 Creating Super Admin...');
        const superAdmin = await User.create({
            name: 'Super Admin',
            email: 'admin@bookit.com',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            isActive: true
        });

        // ==================== 2. TENANTS ====================
        console.log('🏢 Creating Tenants...');
        const tenants = await Tenant.insertMany([
            {
                name: 'GreenField Sports',
                slug: 'greenfield',
                email: 'contact@greenfield.com',
                phone: '+91 98765 43210',
                businessType: 'turf',
                description: 'Premium sports turf with world-class facilities',
                address: { street: '123 Sports Lane', city: 'Bangalore', state: 'Karnataka', zipCode: '560001', country: 'India' },
                status: 'active',
                settings: { currency: 'INR', timezone: 'Asia/Kolkata' }
            },
            {
                name: 'Royal Stay Hotels',
                slug: 'royalstay',
                email: 'info@royalstay.com',
                phone: '+91 98765 12345',
                businessType: 'hotel',
                description: 'Luxury hotels with premium amenities',
                address: { street: '456 Hotel Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India' },
                status: 'active',
                settings: { currency: 'INR', timezone: 'Asia/Kolkata' }
            },
            {
                name: 'Elite Events',
                slug: 'eliteevents',
                email: 'book@eliteevents.com',
                phone: '+91 98765 67890',
                businessType: 'event_space',
                description: 'Premium event spaces for all occasions',
                address: { street: '789 Event Plaza', city: 'Delhi', state: 'Delhi', zipCode: '110001', country: 'India' },
                status: 'active',
                settings: { currency: 'INR', timezone: 'Asia/Kolkata' }
            },
            {
                name: 'PowerFit Gym',
                slug: 'powerfit',
                email: 'join@powerfit.com',
                phone: '+91 98765 11111',
                businessType: 'gym',
                description: 'State-of-the-art fitness center',
                address: { street: '101 Fitness Ave', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600001', country: 'India' },
                status: 'active',
                settings: { currency: 'INR', timezone: 'Asia/Kolkata' }
            },
            {
                name: 'Serenity Spa',
                slug: 'serenityspa',
                email: 'relax@serenityspa.com',
                phone: '+91 98765 22222',
                businessType: 'spa',
                description: 'Luxury spa and wellness center',
                address: { street: '202 Wellness Blvd', city: 'Hyderabad', state: 'Telangana', zipCode: '500001', country: 'India' },
                status: 'active',
                settings: { currency: 'INR', timezone: 'Asia/Kolkata' }
            }
        ]);

        // ==================== 3. TENANT OWNERS & STAFF ====================
        console.log('👥 Creating Tenant Users...');
        const tenantUsers = await User.insertMany([
            // GreenField Sports
            { name: 'Rahul Kumar', email: 'rahul@greenfield.com', password: hashedPassword, role: 'TENANT_OWNER', tenantId: tenants[0]._id, isActive: true },
            { name: 'Priya Sharma', email: 'priya@greenfield.com', password: hashedPassword, role: 'TENANT_ADMIN', tenantId: tenants[0]._id, isActive: true },
            // Royal Stay Hotels
            { name: 'Amit Patel', email: 'amit@royalstay.com', password: hashedPassword, role: 'TENANT_OWNER', tenantId: tenants[1]._id, isActive: true },
            { name: 'Sneha Reddy', email: 'sneha@royalstay.com', password: hashedPassword, role: 'TENANT_ADMIN', tenantId: tenants[1]._id, isActive: true },
            // Elite Events
            { name: 'Vikram Singh', email: 'vikram@eliteevents.com', password: hashedPassword, role: 'TENANT_OWNER', tenantId: tenants[2]._id, isActive: true },
            // PowerFit Gym
            { name: 'Ananya Das', email: 'ananya@powerfit.com', password: hashedPassword, role: 'TENANT_OWNER', tenantId: tenants[3]._id, isActive: true },
            // Serenity Spa
            { name: 'Meera Nair', email: 'meera@serenityspa.com', password: hashedPassword, role: 'TENANT_OWNER', tenantId: tenants[4]._id, isActive: true }
        ]);

        // ==================== 4. CUSTOMERS ====================
        console.log('👤 Creating Customers...');
        const customers = await User.insertMany([
            { name: 'John Doe', email: 'john@example.com', password: hashedPassword, role: 'CUSTOMER', tenantId: tenants[0]._id, mobile: '+91 99999 11111', isActive: true },
            { name: 'Jane Smith', email: 'jane@example.com', password: hashedPassword, role: 'CUSTOMER', tenantId: tenants[0]._id, mobile: '+91 99999 22222', isActive: true },
            { name: 'Ravi Verma', email: 'ravi@example.com', password: hashedPassword, role: 'CUSTOMER', tenantId: tenants[1]._id, mobile: '+91 99999 33333', isActive: true },
            { name: 'Priya Kapoor', email: 'priyak@example.com', password: hashedPassword, role: 'CUSTOMER', tenantId: tenants[1]._id, mobile: '+91 99999 44444', isActive: true },
            { name: 'Arjun Menon', email: 'arjun@example.com', password: hashedPassword, role: 'CUSTOMER', tenantId: tenants[2]._id, mobile: '+91 99999 55555', isActive: true },
            { name: 'Kavitha Iyer', email: 'kavitha@example.com', password: hashedPassword, role: 'CUSTOMER', tenantId: tenants[2]._id, mobile: '+91 99999 66666', isActive: true },
            { name: 'Suresh Kumar', email: 'suresh@example.com', password: hashedPassword, role: 'CUSTOMER', tenantId: tenants[3]._id, mobile: '+91 99999 77777', isActive: true },
            { name: 'Lakshmi Rao', email: 'lakshmi@example.com', password: hashedPassword, role: 'CUSTOMER', tenantId: tenants[4]._id, mobile: '+91 99999 88888', isActive: true }
        ]);

        // ==================== 5. LISTINGS ====================
        console.log('📋 Creating Listings...');
        const listings = await Listing.insertMany([
            // GreenField Sports Turfs
            {
                tenantId: tenants[0]._id,
                title: 'Premium Football Turf',
                description: 'FIFA-standard artificial turf, 7-a-side, floodlights available',
                category: 'turf',
                subcategory: 'football',
                price: 1500,
                duration: 60,
                capacity: 14,
                amenities: ['Floodlights', 'Changing Room', 'Parking', 'Drinking Water', 'First Aid'],
                images: ['/images/turf1.jpg'],
                location: { address: '123 Sports Lane, Bangalore', city: 'Bangalore', state: 'Karnataka', coordinates: { lat: 12.9716, lng: 77.5946 } },
                status: 'published',
                isActive: true
            },
            {
                tenantId: tenants[0]._id,
                title: 'Cricket Practice Net',
                description: 'Professional cricket nets with bowling machine',
                category: 'turf',
                subcategory: 'cricket',
                price: 800,
                duration: 60,
                capacity: 6,
                amenities: ['Bowling Machine', 'Helmets', 'Bats', 'Parking'],
                images: ['/images/cricket1.jpg'],
                location: { address: '123 Sports Lane, Bangalore', city: 'Bangalore', state: 'Karnataka', coordinates: { lat: 12.9716, lng: 77.5946 } },
                status: 'published',
                isActive: true
            },
            // Royal Stay Hotels
            {
                tenantId: tenants[1]._id,
                title: 'Deluxe Suite',
                description: 'Spacious suite with city view, king bed, and premium amenities',
                category: 'hotel',
                subcategory: 'suite',
                price: 5000,
                duration: 1440,
                capacity: 2,
                amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service', 'Breakfast'],
                images: ['/images/hotel1.jpg'],
                location: { address: '456 Hotel Road, Mumbai', city: 'Mumbai', state: 'Maharashtra', coordinates: { lat: 19.0760, lng: 72.8777 } },
                status: 'published',
                isActive: true
            },
            {
                tenantId: tenants[1]._id,
                title: 'Executive Room',
                description: 'Comfortable room perfect for business travelers',
                category: 'hotel',
                subcategory: 'room',
                price: 3000,
                duration: 1440,
                capacity: 2,
                amenities: ['WiFi', 'AC', 'TV', 'Work Desk', 'Coffee Maker'],
                images: ['/images/hotel2.jpg'],
                location: { address: '456 Hotel Road, Mumbai', city: 'Mumbai', state: 'Maharashtra', coordinates: { lat: 19.0760, lng: 72.8777 } },
                status: 'published',
                isActive: true
            },
            // Elite Events
            {
                tenantId: tenants[2]._id,
                title: 'Grand Ballroom',
                description: 'Elegant ballroom for weddings and corporate events, capacity 500',
                category: 'event_space',
                subcategory: 'ballroom',
                price: 50000,
                duration: 480,
                capacity: 500,
                amenities: ['Stage', 'Sound System', 'Projector', 'AC', 'Catering', 'Valet Parking'],
                images: ['/images/event1.jpg'],
                location: { address: '789 Event Plaza, Delhi', city: 'Delhi', state: 'Delhi', coordinates: { lat: 28.6139, lng: 77.2090 } },
                status: 'published',
                isActive: true
            },
            {
                tenantId: tenants[2]._id,
                title: 'Conference Room',
                description: 'Modern conference room for meetings and seminars',
                category: 'event_space',
                subcategory: 'meeting_room',
                price: 5000,
                duration: 240,
                capacity: 30,
                amenities: ['Projector', 'Whiteboard', 'WiFi', 'AC', 'Coffee/Tea'],
                images: ['/images/event2.jpg'],
                location: { address: '789 Event Plaza, Delhi', city: 'Delhi', state: 'Delhi', coordinates: { lat: 28.6139, lng: 77.2090 } },
                status: 'published',
                isActive: true
            },
            // PowerFit Gym
            {
                tenantId: tenants[3]._id,
                title: 'Personal Training Session',
                description: 'One-on-one training with certified fitness expert',
                category: 'fitness',
                subcategory: 'personal_training',
                price: 1200,
                duration: 60,
                capacity: 1,
                amenities: ['Trainer', 'Equipment', 'Towel', 'Locker'],
                images: ['/images/gym1.jpg'],
                location: { address: '101 Fitness Ave, Chennai', city: 'Chennai', state: 'Tamil Nadu', coordinates: { lat: 13.0827, lng: 80.2707 } },
                status: 'published',
                isActive: true
            },
            // Serenity Spa
            {
                tenantId: tenants[4]._id,
                title: 'Relaxation Massage',
                description: 'Full body Swedish massage for ultimate relaxation',
                category: 'wellness',
                subcategory: 'massage',
                price: 2500,
                duration: 90,
                capacity: 1,
                amenities: ['Private Room', 'Aromatherapy', 'Steam Room', 'Herbal Tea'],
                images: ['/images/spa1.jpg'],
                location: { address: '202 Wellness Blvd, Hyderabad', city: 'Hyderabad', state: 'Telangana', coordinates: { lat: 17.3850, lng: 78.4867 } },
                status: 'published',
                isActive: true
            }
        ]);

        // ==================== 6. SLOTS ====================
        console.log('⏰ Creating Time Slots...');
        const today = new Date();
        const slots = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            // Create slots for first 3 listings (turfs)
            for (let hour = 6; hour <= 22; hour++) {
                slots.push({
                    listingId: listings[0]._id,
                    tenantId: tenants[0]._id,
                    date: date,
                    startTime: `${hour.toString().padStart(2, '0')}:00`,
                    endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
                    price: hour >= 17 ? 1800 : 1500,
                    isAvailable: Math.random() > 0.3,
                    isActive: true
                });
            }
        }
        await Slot.insertMany(slots);

        // ==================== 7. BOOKINGS ====================
        console.log('📅 Creating Bookings...');
        const bookings = await Booking.insertMany([
            {
                tenantId: tenants[0]._id,
                listingId: listings[0]._id,
                userId: customers[0]._id,
                customerName: customers[0].name,
                customerEmail: 'john@example.com',
                customerPhone: '+91 99999 11111',
                bookingDate: new Date(today.getTime() + 86400000),
                startTime: '18:00',
                endTime: '19:00',
                totalAmount: 1800,
                status: 'CONFIRMED',
                paymentStatus: 'PAID'
            },
            {
                tenantId: tenants[0]._id,
                listingId: listings[0]._id,
                userId: customers[1]._id,
                customerName: customers[1].name,
                customerEmail: 'jane@example.com',
                customerPhone: '+91 99999 22222',
                bookingDate: new Date(today.getTime() + 86400000 * 2),
                startTime: '10:00',
                endTime: '11:00',
                totalAmount: 1500,
                status: 'CONFIRMED',
                paymentStatus: 'PAID'
            },
            {
                tenantId: tenants[1]._id,
                listingId: listings[2]._id,
                userId: customers[2]._id,
                customerName: customers[2].name,
                customerEmail: 'ravi@example.com',
                customerPhone: '+91 99999 33333',
                bookingDate: new Date(today.getTime() + 86400000 * 3),
                startTime: '14:00',
                endTime: '14:00',
                totalAmount: 5000,
                status: 'CONFIRMED',
                paymentStatus: 'PAID'
            },
            {
                tenantId: tenants[2]._id,
                listingId: listings[4]._id,
                userId: customers[4]._id,
                customerName: customers[4].name,
                customerEmail: 'arjun@example.com',
                customerPhone: '+91 99999 55555',
                bookingDate: new Date(today.getTime() + 86400000 * 7),
                startTime: '10:00',
                endTime: '18:00',
                totalAmount: 50000,
                status: 'PENDING',
                paymentStatus: 'PENDING'
            },
            {
                tenantId: tenants[0]._id,
                listingId: listings[1]._id,
                userId: customers[0]._id,
                customerName: customers[0].name,
                customerEmail: 'john@example.com',
                customerPhone: '+91 99999 11111',
                bookingDate: new Date(today.getTime() - 86400000 * 2),
                startTime: '17:00',
                endTime: '18:00',
                totalAmount: 800,
                status: 'COMPLETED',
                paymentStatus: 'PAID'
            },
            {
                tenantId: tenants[3]._id,
                listingId: listings[6]._id,
                userId: customers[6]._id,
                customerName: customers[6].name,
                customerEmail: 'suresh@example.com',
                customerPhone: '+91 99999 77777',
                bookingDate: new Date(today.getTime() + 86400000),
                startTime: '09:00',
                endTime: '10:00',
                totalAmount: 1200,
                status: 'CONFIRMED',
                paymentStatus: 'PAID'
            }
        ]);

        // ==================== 8. PAYMENTS ====================
        console.log('💳 Creating Payments...');
        await Payment.insertMany([
            {
                tenantId: tenants[0]._id,
                bookingId: bookings[0]._id,
                userId: customers[0]._id,
                amount: 1800,
                currency: 'INR',
                status: 'SUCCESS',
                paymentMethod: 'upi',
                transactionId: 'TXN' + Date.now() + '001',
                gatewayResponse: { status: 'captured' }
            },
            {
                tenantId: tenants[0]._id,
                bookingId: bookings[1]._id,
                userId: customers[1]._id,
                amount: 1500,
                currency: 'INR',
                status: 'SUCCESS',
                paymentMethod: 'card',
                transactionId: 'TXN' + Date.now() + '002',
                gatewayResponse: { status: 'captured' }
            },
            {
                tenantId: tenants[1]._id,
                bookingId: bookings[2]._id,
                userId: customers[2]._id,
                amount: 5000,
                currency: 'INR',
                status: 'SUCCESS',
                paymentMethod: 'netbanking',
                transactionId: 'TXN' + Date.now() + '003',
                gatewayResponse: { status: 'captured' }
            },
            {
                tenantId: tenants[0]._id,
                bookingId: bookings[4]._id,
                userId: customers[0]._id,
                amount: 800,
                currency: 'INR',
                status: 'SUCCESS',
                paymentMethod: 'upi',
                transactionId: 'TXN' + Date.now() + '004',
                gatewayResponse: { status: 'captured' }
            },
            {
                tenantId: tenants[3]._id,
                bookingId: bookings[5]._id,
                userId: customers[6]._id,
                amount: 1200,
                currency: 'INR',
                status: 'SUCCESS',
                paymentMethod: 'card',
                transactionId: 'TXN' + Date.now() + '005',
                gatewayResponse: { status: 'captured' }
            }
        ]);

        // ==================== 9. REVIEWS ====================
        console.log('⭐ Creating Reviews...');
        await Review.insertMany([
            {
                tenantId: tenants[0]._id,
                listingId: listings[0]._id,
                userId: customers[0]._id,
                bookingId: bookings[4]._id,
                rating: 5,
                title: 'Excellent Turf!',
                comment: 'Best football turf in the city. Well maintained and great facilities.',
                status: 'approved'
            },
            {
                tenantId: tenants[0]._id,
                listingId: listings[0]._id,
                userId: customers[1]._id,
                rating: 4,
                title: 'Good Experience',
                comment: 'Nice turf with good lighting. Parking could be better.',
                status: 'approved'
            },
            {
                tenantId: tenants[1]._id,
                listingId: listings[2]._id,
                userId: customers[2]._id,
                rating: 5,
                title: 'Luxury Stay',
                comment: 'Amazing suite with beautiful city view. Staff was very helpful.',
                status: 'approved'
            },
            {
                tenantId: tenants[2]._id,
                listingId: listings[4]._id,
                userId: customers[4]._id,
                rating: 4,
                title: 'Great Venue',
                comment: 'Perfect for our corporate event. Sound system was excellent.',
                status: 'approved'
            },
            {
                tenantId: tenants[4]._id,
                listingId: listings[7]._id,
                userId: customers[7]._id,
                rating: 5,
                title: 'So Relaxing!',
                comment: 'Best massage I\'ve ever had. Very professional and calming ambiance.',
                status: 'approved'
            }
        ]);

        // ==================== 10. COUPONS ====================
        console.log('🎟️ Creating Coupons...');
        await Coupon.insertMany([
            {
                tenantId: tenants[0]._id,
                code: 'WELCOME20',
                name: 'Welcome Discount',
                description: '20% off on your first booking',
                discountType: 'percentage',
                discountValue: 20,
                minOrderValue: 500,
                maxDiscount: 500,
                usageLimit: 100,
                usedCount: 15,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 30 * 86400000),
                isActive: true
            },
            {
                tenantId: tenants[0]._id,
                code: 'FLAT100',
                name: 'Flat ₹100 Off',
                description: 'Flat ₹100 discount on bookings above ₹1000',
                discountType: 'fixed',
                discountValue: 100,
                minOrderValue: 1000,
                usageLimit: 50,
                usedCount: 8,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 15 * 86400000),
                isActive: true
            },
            {
                tenantId: tenants[1]._id,
                code: 'STAYMORE',
                name: 'Extended Stay Discount',
                description: '25% off on stays of 3 nights or more',
                discountType: 'percentage',
                discountValue: 25,
                minOrderValue: 10000,
                maxDiscount: 5000,
                usageLimit: 30,
                usedCount: 5,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 60 * 86400000),
                isActive: true
            },
            {
                tenantId: tenants[2]._id,
                code: 'EVENT500',
                name: 'Event Booking Discount',
                description: 'Flat ₹5000 off on event bookings',
                discountType: 'fixed',
                discountValue: 5000,
                minOrderValue: 25000,
                usageLimit: 20,
                usedCount: 3,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 45 * 86400000),
                isActive: true
            },
            {
                tenantId: tenants[3]._id,
                code: 'FIT15',
                name: 'Fitness First',
                description: '15% off on training sessions',
                discountType: 'percentage',
                discountValue: 15,
                minOrderValue: 0,
                maxDiscount: 300,
                usageLimit: 100,
                usedCount: 22,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 30 * 86400000),
                isActive: true
            }
        ]);

        // ==================== 11. TENANT SUBSCRIPTIONS ====================
        console.log('📜 Creating Tenant Subscriptions...');
        await TenantSubscription.insertMany([
            {
                tenantId: tenants[0]._id,
                plan: 'pro',
                status: 'active',
                subscriptionStartDate: new Date(),
                subscriptionEndDate: new Date(Date.now() + 365 * 86400000),
                billingCycle: 'yearly',
                amount: 24990,
                features: { maxListings: 10, maxBookingsPerMonth: -1, customDomain: true, analytics: true }
            },
            {
                tenantId: tenants[1]._id,
                plan: 'pro',
                status: 'active',
                subscriptionStartDate: new Date(),
                subscriptionEndDate: new Date(Date.now() + 365 * 86400000),
                billingCycle: 'yearly',
                amount: 24990,
                features: { maxListings: 10, maxBookingsPerMonth: -1, customDomain: true, analytics: true }
            },
            {
                tenantId: tenants[2]._id,
                plan: 'enterprise',
                status: 'active',
                subscriptionStartDate: new Date(),
                subscriptionEndDate: new Date(Date.now() + 365 * 86400000),
                billingCycle: 'yearly',
                amount: 49990,
                features: { maxListings: -1, maxBookingsPerMonth: -1, customDomain: true, whiteLabel: true, analytics: true }
            },
            {
                tenantId: tenants[3]._id,
                plan: 'basic',
                status: 'active',
                subscriptionStartDate: new Date(),
                subscriptionEndDate: new Date(Date.now() + 30 * 86400000),
                billingCycle: 'monthly',
                amount: 999,
                features: { maxListings: 3, maxBookingsPerMonth: 100 }
            },
            {
                tenantId: tenants[4]._id,
                plan: 'basic',
                status: 'trial',
                trialStartDate: new Date(),
                trialEndDate: new Date(Date.now() + 14 * 86400000),
                amount: 0,
                features: { maxListings: 3, maxBookingsPerMonth: 50 }
            }
        ]);

        // ==================== 12. NOTIFICATIONS ====================
        console.log('🔔 Creating Notifications...');
        await Notification.insertMany([
            { userId: customers[0]._id, type: 'booking', title: 'Booking Confirmed!', message: 'Your booking for Premium Football Turf has been confirmed.', read: false },
            { userId: customers[1]._id, type: 'booking', title: 'Booking Confirmed!', message: 'Your booking for Premium Football Turf has been confirmed.', read: true },
            { userId: customers[2]._id, type: 'booking', title: 'Booking Confirmed!', message: 'Your booking at Deluxe Suite has been confirmed.', read: false },
            { userId: tenantUsers[0]._id, type: 'system', title: 'New Booking!', message: 'You have a new booking for Premium Football Turf.', read: false },
            { userId: tenantUsers[2]._id, type: 'system', title: 'New Booking!', message: 'You have a new booking for Deluxe Suite.', read: true },
            { userId: superAdmin._id, type: 'system', title: 'Welcome!', message: 'Welcome to BookIt Admin Panel. You have full access to all features.', read: true }
        ]);

        console.log('\n========================================');
        console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
        console.log('========================================\n');
        console.log('📝 TEST ACCOUNTS:');
        console.log('----------------------------------------');
        console.log('SUPER ADMIN:');
        console.log('  Email: admin@bookit.com');
        console.log('  Password: Password123!');
        console.log('');
        console.log('TENANT OWNERS:');
        console.log('  Email: rahul@greenfield.com (GreenField Sports)');
        console.log('  Email: amit@royalstay.com (Royal Stay Hotels)');
        console.log('  Email: vikram@eliteevents.com (Elite Events)');
        console.log('  Password: Password123!');
        console.log('');
        console.log('CUSTOMERS:');
        console.log('  Email: john@example.com');
        console.log('  Email: jane@example.com');
        console.log('  Password: Password123!');
        console.log('----------------------------------------\n');

        await mongoose.disconnect();
        console.log('📦 Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedDatabase();
