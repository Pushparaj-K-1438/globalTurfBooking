// Database seed script for initializing the platform with default data
import connectDB from "../lib/mongoose";
import Role from "../models/Role";
import Amenity from "../models/Amenity";
import Currency from "../models/Currency";
import TaxRule from "../models/TaxRule";
import NotificationTemplate from "../models/NotificationTemplate";

async function seedRoles() {
    const roles = [
        { name: 'Super Admin', slug: 'super_admin', description: 'Full platform access', isSystem: true, permissions: [{ resource: '*', actions: ['manage'] }] },
        { name: 'Tenant Owner', slug: 'tenant_owner', description: 'Full tenant access', isSystem: true, permissions: [{ resource: '*', actions: ['manage'] }] },
        { name: 'Tenant Admin', slug: 'tenant_admin', description: 'Manage listings and bookings', isSystem: true, permissions: [{ resource: 'listings', actions: ['create', 'read', 'update', 'delete'] }, { resource: 'bookings', actions: ['read', 'update'] }, { resource: 'slots', actions: ['create', 'read', 'update', 'delete'] }] },
        { name: 'Staff', slug: 'staff', description: 'View and manage daily operations', isSystem: true, permissions: [{ resource: 'bookings', actions: ['read', 'update'] }, { resource: 'slots', actions: ['read'] }] },
        { name: 'Customer', slug: 'customer', description: 'Book listings', isSystem: true, permissions: [{ resource: 'listings', actions: ['read'] }, { resource: 'bookings', actions: ['create', 'read'] }] },
    ];

    for (const role of roles) {
        await Role.findOneAndUpdate({ slug: role.slug }, role, { upsert: true, new: true });
    }
    console.log("✓ Roles seeded");
}

async function seedAmenities() {
    const amenities = [
        // Sports
        { name: 'Football', slug: 'football', category: 'sports', icon: 'Goal' },
        { name: 'Cricket', slug: 'cricket', category: 'sports', icon: 'CircleDot' },
        { name: 'Basketball', slug: 'basketball', category: 'sports', icon: 'Circle' },
        { name: 'Tennis', slug: 'tennis', category: 'sports', icon: 'Circle' },
        { name: 'Badminton', slug: 'badminton', category: 'sports', icon: 'Wind' },
        { name: 'Floodlights', slug: 'floodlights', category: 'sports', icon: 'Lightbulb' },

        // Comfort
        { name: 'Air Conditioning', slug: 'air_conditioning', category: 'comfort', icon: 'Wind' },
        { name: 'WiFi', slug: 'wifi', category: 'comfort', icon: 'Wifi' },
        { name: 'Parking', slug: 'parking', category: 'comfort', icon: 'ParkingCircle' },
        { name: 'Changing Rooms', slug: 'changing_rooms', category: 'comfort', icon: 'Door' },
        { name: 'Showers', slug: 'showers', category: 'comfort', icon: 'Droplets' },
        { name: 'Lockers', slug: 'lockers', category: 'comfort', icon: 'Lock' },
        { name: 'Cafeteria', slug: 'cafeteria', category: 'comfort', icon: 'Coffee' },
        { name: 'First Aid', slug: 'first_aid', category: 'comfort', icon: 'Cross' },

        // Safety
        { name: 'CCTV', slug: 'cctv', category: 'safety', icon: 'Camera' },
        { name: 'Security Guard', slug: 'security_guard', category: 'safety', icon: 'Shield' },
        { name: 'Fire Extinguisher', slug: 'fire_extinguisher', category: 'safety', icon: 'Flame' },

        // Accessibility
        { name: 'Wheelchair Access', slug: 'wheelchair_access', category: 'accessibility', icon: 'Accessibility' },
        { name: 'Elevator', slug: 'elevator', category: 'accessibility', icon: 'ArrowUpDown' },

        // General
        { name: 'Power Backup', slug: 'power_backup', category: 'general', icon: 'Zap' },
        { name: 'Drinking Water', slug: 'drinking_water', category: 'general', icon: 'GlassWater' },
        { name: 'Restrooms', slug: 'restrooms', category: 'general', icon: 'Bath' },
    ];

    for (const amenity of amenities) {
        await Amenity.findOneAndUpdate({ slug: amenity.slug }, { ...amenity, isActive: true }, { upsert: true, new: true });
    }
    console.log("✓ Amenities seeded");
}

async function seedCurrencies() {
    const currencies = [
        { code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRate: 1, isBase: true },
        { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 0.012 },
        { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.011 },
        { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.0095 },
        { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', exchangeRate: 0.044 },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', exchangeRate: 0.016 },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', exchangeRate: 0.018 },
    ];

    for (const currency of currencies) {
        await Currency.findOneAndUpdate({ code: currency.code }, { ...currency, isActive: true }, { upsert: true, new: true });
    }
    console.log("✓ Currencies seeded");
}

async function seedTaxRules() {
    const taxRules = [
        { name: 'GST 18%', code: 'GST18', rate: 18, country: 'IN', category: 'service' },
        { name: 'GST 12%', code: 'GST12', rate: 12, country: 'IN', category: 'accommodation' },
        { name: 'GST 5%', code: 'GST5', rate: 5, country: 'IN', category: 'food' },
        { name: 'VAT 20%', code: 'VAT20', rate: 20, country: 'UK', category: 'service' },
        { name: 'VAT 19%', code: 'VAT19', rate: 19, country: 'DE', category: 'service' },
        { name: 'Sales Tax', code: 'SALESTAX', rate: 8.875, country: 'US', state: 'NY', category: 'service' },
    ];

    for (const rule of taxRules) {
        await TaxRule.findOneAndUpdate({ code: rule.code }, { ...rule, isActive: true }, { upsert: true, new: true });
    }
    console.log("✓ Tax Rules seeded");
}

async function seedNotificationTemplates() {
    const templates = [
        {
            name: 'Booking Confirmation',
            slug: 'booking_confirmed',
            event: 'booking_confirmed',
            channels: ['email', 'sms', 'in_app'],
            email: {
                subject: 'Booking Confirmed - {{listing_name}}',
                htmlBody: '<h1>Your booking is confirmed!</h1><p>Booking ID: {{booking_id}}</p><p>Date: {{booking_date}}</p><p>Time: {{booking_time}}</p>',
            },
            sms: { body: 'Booking confirmed! ID: {{booking_id}} on {{booking_date}} at {{booking_time}}' },
            inApp: { title: 'Booking Confirmed', body: 'Your booking for {{listing_name}} is confirmed!', type: 'success' },
            variables: ['booking_id', 'listing_name', 'booking_date', 'booking_time', 'customer_name'],
        },
        {
            name: 'Booking Cancelled',
            slug: 'booking_cancelled',
            event: 'booking_cancelled',
            channels: ['email', 'in_app'],
            email: {
                subject: 'Booking Cancelled - {{listing_name}}',
                htmlBody: '<h1>Booking Cancelled</h1><p>Your booking {{booking_id}} has been cancelled.</p>',
            },
            inApp: { title: 'Booking Cancelled', body: 'Your booking for {{listing_name}} has been cancelled', type: 'warning' },
            variables: ['booking_id', 'listing_name', 'customer_name', 'refund_amount'],
        },
        {
            name: 'Payment Success',
            slug: 'payment_success',
            event: 'payment_success',
            channels: ['email', 'in_app'],
            email: {
                subject: 'Payment Received',
                htmlBody: '<h1>Thank you!</h1><p>We received your payment of {{amount}}</p>',
            },
            inApp: { title: 'Payment Successful', body: 'Payment of {{amount}} received successfully', type: 'success' },
            variables: ['amount', 'booking_id', 'payment_id'],
        },
        {
            name: 'Booking Reminder 24h',
            slug: 'booking_reminder_24h',
            event: 'booking_reminder_24h',
            channels: ['email', 'sms', 'push'],
            email: { subject: 'Reminder: Booking Tomorrow - {{listing_name}}', htmlBody: '<h1>See you tomorrow!</h1><p>Your booking at {{listing_name}} is tomorrow at {{booking_time}}.</p>' },
            sms: { body: 'Reminder: Your booking at {{listing_name}} is tomorrow at {{booking_time}}' },
            push: { title: 'Booking Tomorrow!', body: 'Do not forget your booking at {{listing_name}}', icon: 'calendar' },
            variables: ['listing_name', 'booking_date', 'booking_time'],
        },
        {
            name: 'Review Request',
            slug: 'review_request',
            event: 'review_request',
            channels: ['email', 'in_app'],
            email: { subject: 'How was your experience at {{listing_name}}?', htmlBody: '<h1>Share your feedback!</h1><p>We hope you enjoyed your time at {{listing_name}}. Please take a moment to leave a review.</p>' },
            inApp: { title: 'Rate Your Experience', body: 'How was your visit to {{listing_name}}?', type: 'info', actionUrl: '/reviews/new' },
            variables: ['listing_name', 'booking_id'],
        },
    ];

    for (const template of templates) {
        await NotificationTemplate.findOneAndUpdate({ slug: template.slug }, { ...template, isGlobal: true, isActive: true }, { upsert: true, new: true });
    }
    console.log("✓ Notification Templates seeded");
}

export async function seedDatabase() {
    try {
        await connectDB();
        console.log("\n🌱 Starting database seed...\n");

        await seedRoles();
        await seedAmenities();
        await seedCurrencies();
        await seedTaxRules();
        await seedNotificationTemplates();

        console.log("\n✅ Database seeded successfully!\n");
    } catch (error) {
        console.error("❌ Seed failed:", error);
        throw error;
    }
}

// Run if called directly
if (process.argv[1]?.endsWith('seed.js')) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
