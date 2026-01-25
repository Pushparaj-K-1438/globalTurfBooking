// Database Seeding Script
// Run with: node scripts/seed.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

// ==================== SCHEMAS ====================

const tenantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    email: { type: String },
    phone: { type: String },
    businessType: { type: String },
    description: { type: String },
    address: { street: String, city: String, state: String, zipCode: String, country: String },
    status: { type: String, default: 'active' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    modules: [{ type: String }],
    settings: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ["SUPER_ADMIN", "TENANT_OWNER", "TENANT_ADMIN", "STAFF", "CUSTOMER"], default: "CUSTOMER" },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    isActive: { type: Boolean, default: true },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    lastLogin: { type: Date },
}, { timestamps: true });

const listingSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    subcategory: { type: String },
    type: { type: String }, // NEW field to match UI
    price: { type: Number, required: true },
    priceConfig: { basePrice: Number, pricingModel: String }, // NEW structure to match UI
    duration: { type: Number },
    capacity: { type: Number },
    amenities: [String],
    rules: [String], // NEW
    images: [String],
    location: { address: String, city: String, state: String, coordinates: { lat: Number, lng: Number } },
    status: { type: String, default: 'draft' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const slotSchema = new mongoose.Schema({
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    date: { type: Date },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    price: { type: Number },
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
    bookingId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: String, required: true },
    timeSlots: [{ type: String }],
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, default: 'PENDING' },
    paymentStatus: { type: String, default: 'PENDING' },
    appliedOffer: {
        offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
        name: String,
        discountType: String,
        discountValue: Number,
    },
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, default: 'PENDING' },
    paymentMethod: { type: String },
    transactionId: { type: String },
    gatewayResponse: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    rating: { type: Number, min: 1, max: 5 },
    title: { type: String },
    comment: { type: String },
    status: { type: String, default: 'pending' },
}, { timestamps: true });

const couponSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    code: { type: String, required: true },
    name: { type: String },
    description: { type: String },
    discountType: { type: String },
    discountValue: { type: Number },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    totalUsageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// SUPER ADMIN SCHEMAS
const listingTypeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String, default: 'Box' },
    isPayable: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const pricingModelSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const amenitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String },
    category: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });


// MODELS
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);
const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);
const Slot = mongoose.models.Slot || mongoose.model('Slot', slotSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
const ListingType = mongoose.models.ListingType || mongoose.model('ListingType', listingTypeSchema);
const PricingModel = mongoose.models.PricingModel || mongoose.model('PricingModel', pricingModelSchema);
const Amenity = mongoose.models.Amenity || mongoose.model('Amenity', amenitySchema);

async function clearDatabase() {
    console.log('🗑️  Clearing existing data...');
    try { await Slot.collection.dropIndexes(); } catch (e) { }
    try { await Tenant.collection.dropIndexes(); } catch (e) { }
    try { await ListingType.collection.dropIndexes(); } catch (e) { }
    try { await PricingModel.collection.dropIndexes(); } catch (e) { }

    await User.deleteMany({});
    await Tenant.deleteMany({});
    await Listing.deleteMany({});
    await Slot.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});
    await Review.deleteMany({});
    await Coupon.deleteMany({});
    await ListingType.deleteMany({});
    await PricingModel.deleteMany({});
    await Amenity.deleteMany({});
    console.log('✅ Database cleared!');
}

async function seedDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('📦 Connected to MongoDB');

        await clearDatabase();

        const hashedPassword = await bcrypt.hash('Password123!', 10);

        // ==================== 0. SYSTEM DATA (Super Admin) ====================
        console.log('Creating System Data...');

        await ListingType.insertMany([
            { name: 'Turf', slug: 'turf', description: 'Sports turf for booking', icon: 'Trophy', isPayable: true },
            { name: 'Hotel', slug: 'hotel', description: 'Hotel rooms and suites', icon: 'Hotel', isPayable: true },
            { name: 'Event', slug: 'event', description: 'Event spaces and halls', icon: 'Calendar', isPayable: true },
            { name: 'Gym', slug: 'gym', description: 'Fitness centers and gyms', icon: 'Dumbbell', isPayable: true },
            { name: 'Wellness', slug: 'wellness', description: 'Spas and wellness centers', icon: 'Sparkles', isPayable: true }
        ]);

        await PricingModel.insertMany([
            { name: 'Per Hour', slug: 'per_hour', description: 'Charge by the hour' },
            { name: 'Per Day', slug: 'per_day', description: 'Charge by the day' },
            { name: 'Fixed', slug: 'fixed', description: 'Fixed price per booking' },
            { name: 'Per Person', slug: 'per_person', description: 'Charge per person' }
        ]);

        await Amenity.insertMany([
            { name: 'WiFi', slug: 'wifi', icon: 'Wifi', category: 'General' },
            { name: 'Parking', slug: 'parking', icon: 'Car', category: 'General' },
            { name: 'AC', slug: 'ac', icon: 'Wind', category: 'General' },
            { name: 'Changing Room', slug: 'changing_room', icon: 'Shirt', category: 'Sports' },
            { name: 'Water', slug: 'water', icon: 'Droplet', category: 'General' }
        ]);


        // ==================== 1. USERS (Super Admin) ====================
        console.log('Creating Super Admin...');
        await User.create({
            name: 'Super Admin',
            email: 'admin@bookit.com',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            isActive: true
        });

        // ==================== 2. USERS (Tenant Owners) ====================
        const ownerData = [
            { name: 'Rahul Turf', email: 'rahul@greenfield.com' },
            { name: 'Amit Hotel', email: 'amit@royalstay.com' },
            { name: 'Vikram Event', email: 'vikram@eliteevents.com' },
        ];

        const owners = [];
        for (const o of ownerData) {
            const user = await User.create({
                name: o.name,
                email: o.email,
                password: hashedPassword,
                role: 'TENANT_OWNER',
                isActive: true
            });
            owners.push(user);
        }

        // ==================== 3. TENANTS ====================
        console.log('Creating Tenants...');
        const tenantData = [
            {
                name: 'GreenField Sports',
                slug: 'greenfield',
                modules: ['turfs', 'bookings', 'payments', 'reviews', 'coupons'],
                ownerIndex: 0
            },
            {
                name: 'Royal Stay Hotels',
                slug: 'royalstay',
                modules: ['hotels', 'bookings', 'payments', 'coupons'],
                ownerIndex: 1
            },
            {
                name: 'Elite Events',
                slug: 'eliteevents',
                modules: ['events', 'bookings', 'reviews'],
                ownerIndex: 2
            }
        ];

        const tenants = [];
        for (const t of tenantData) {
            const tenant = await Tenant.create({
                name: t.name,
                slug: t.slug,
                ownerId: owners[t.ownerIndex]._id,
                email: owners[t.ownerIndex].email,
                status: 'active',
                modules: t.modules,
                address: { city: 'Bangalore', country: 'India' }
            });
            tenants.push(tenant);
            await User.findByIdAndUpdate(owners[t.ownerIndex]._id, { tenantId: tenant._id });
        }

        // ==================== 4. LISTINGS ====================
        console.log('Creating Listings...');
        const listings = [];

        // Tenant 0
        for (let i = 1; i <= 5; i++) {
            listings.push({
                tenantId: tenants[0]._id,
                title: `Turf Arena ${i}`,
                description: `Best football turf ${i}`,
                category: 'turf',
                type: 'turf',
                price: 1000 + (i * 100),
                priceConfig: { basePrice: 1000 + (i * 100), pricingModel: 'per_hour' },
                location: { city: 'Bangalore', address: '123 Sports Road, Bangalore' },
                status: 'published',
                isActive: true,
                amenities: ['wifi', 'parking'],
                rules: ['No smoking']
            });
        }

        // Tenant 1
        for (let i = 1; i <= 5; i++) {
            listings.push({
                tenantId: tenants[1]._id,
                title: `Luxury Room ${i}`,
                description: `Sea view suite ${i}`,
                category: 'hotel',
                type: 'hotel',
                price: 5000 + (i * 500),
                priceConfig: { basePrice: 5000 + (i * 500), pricingModel: 'per_day' },
                location: { city: 'Mumbai', address: '456 Sea View, Mumbai' },
                status: 'published',
                isActive: true,
                amenities: ['wifi', 'ac'],
                rules: ['No pets']
            });
        }

        const createdListings = await Listing.insertMany(listings);

        // ==================== 5. SLOTS ====================
        console.log('Creating Slots...');
        const slots = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const turfListing = createdListings[0];

        for (let d = 0; d < 7; d++) {
            const date = new Date(today);
            date.setDate(date.getDate() + d);

            for (let h = 6; h < 22; h++) {
                const startTime = `${h.toString().padStart(2, '0')}:00`;
                const endTime = `${(h + 1).toString().padStart(2, '0')}:00`;

                slots.push({
                    tenantId: tenants[0]._id,
                    listingId: turfListing._id,
                    date: date,
                    startTime: startTime,
                    endTime: endTime,
                    price: turfListing.price,
                    isAvailable: Math.random() > 0.3,
                    isActive: true
                });
            }
        }
        await Slot.insertMany(slots);

        // ==================== 6. BOOKINGS, PAYMENTS, REVIEWS ====================
        console.log('Creating Bookings, Payments, Reviews...');
        const customer = await User.create({
            name: 'John Customer',
            email: 'john@customer.com',
            password: hashedPassword,
            role: 'CUSTOMER',
            tenantId: tenants[0]._id
        });

        const bookings = [];
        for (let i = 0; i < 5; i++) {
            bookings.push({
                bookingId: `BK${Date.now()}${i}`,
                name: customer.name,
                mobile: '9999999999',
                email: customer.email,
                date: new Date().toISOString().split('T')[0],
                timeSlots: [`${10 + i}:00-${11 + i}:00`],
                totalAmount: 1200,
                finalAmount: 1200,
                tenantId: tenants[0]._id,
                listingId: createdListings[0]._id,
                userId: customer._id,
                status: 'CONFIRMED',
                paymentStatus: 'PAID'
            });
        }
        const createdBookings = await Booking.insertMany(bookings);

        // Payments
        const payments = [];
        for (let i = 0; i < 3; i++) {
            payments.push({
                tenantId: tenants[0]._id,
                bookingId: createdBookings[i]._id,
                userId: createdBookings[i].userId,
                amount: createdBookings[i].totalAmount,
                currency: 'INR',
                status: 'SUCCESS',
                paymentMethod: 'upi',
                transactionId: `TXN${Date.now()}${i}`
            });
        }
        await Payment.insertMany(payments);

        // Reviews
        const reviews = [];
        reviews.push({
            tenantId: tenants[0]._id,
            listingId: createdBookings[0].listingId,
            userId: createdBookings[0].userId,
            bookingId: createdBookings[0]._id,
            rating: 5,
            title: 'Great Experience',
            comment: 'Loved the turf quality!',
            status: 'approved'
        });
        await Review.insertMany(reviews);

        // ==================== 7. COUPONS ====================
        console.log('Creating Coupons...');
        const coupons = [];
        coupons.push({
            tenantId: tenants[0]._id,
            code: 'WELCOME20',
            name: 'Welcome Bonus',
            discountType: 'percentage',
            discountValue: 20,
            minOrderValue: 500,
            maxDiscount: 500,
            totalUsageLimit: 100,
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            isActive: true
        });
        await Coupon.insertMany(coupons);

        console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedDatabase();
