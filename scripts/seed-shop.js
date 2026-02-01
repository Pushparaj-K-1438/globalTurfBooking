const mongoose = require('mongoose');

// Use a simple schema for the script
const TenantSchema = new mongoose.Schema({}, { strict: false });
const ProductSchema = new mongoose.Schema({
    name: String,
    slug: String,
    description: String,
    price: Number,
    category: String,
    images: [String],
    tenantId: mongoose.Schema.Types.ObjectId,
    isActive: { type: Boolean, default: true },
    stock: { type: Number, default: 10 }
}, { timestamps: true });

async function seedProducts() {
    try {
        const uri = 'mongodb+srv://sanjuraj1438_db_user:6RgkXsfJ9AMUKiTy@cluster0.gbg4avg.mongodb.net/turfbooking?retryWrites=true&w=majority';
        await mongoose.connect(uri);
        console.log('Connected to Atlas DB');

        const Tenant = mongoose.model('Tenant', TenantSchema);
        const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

        const ecommerceTenant = await Tenant.findOne({ slug: 'ecommerce-store' });
        if (!ecommerceTenant) {
            console.log('Ecommerce tenant not found');
            process.exit(1);
        }

        console.log('Found tenant:', ecommerceTenant.name, ecommerceTenant._id);

        const products = [
            {
                name: "Alpha Pro Football Boots",
                slug: "alpha-pro-boots",
                price: 4500,
                category: "Footwear",
                description: "Lightweight, high-traction boots for professional turf play.",
                images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"],
                tenantId: ecommerceTenant._id
            },
            {
                name: "Titan Grip Goalkeeper Gloves",
                slug: "titan-grip-gloves",
                price: 2200,
                category: "Gear",
                description: "Professional grade grip with finger protection technology.",
                images: ["https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?w=800"],
                tenantId: ecommerceTenant._id
            },
            {
                name: "Elite Training Jersey",
                slug: "elite-training-jersey",
                price: 1800,
                category: "Apparel",
                description: "Moisture-wicking fabric for intense training sessions.",
                images: ["https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800"],
                tenantId: ecommerceTenant._id
            },
            {
                name: "Match Day Official Ball",
                slug: "match-day-ball",
                price: 3200,
                category: "Equipment",
                description: "FIFA quality certified match ball with aerodynamic stability.",
                images: ["https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800"],
                tenantId: ecommerceTenant._id
            },
            {
                name: "Compression Recovery Socks",
                slug: "recovery-socks",
                price: 850,
                category: "Apparel",
                description: "Optimized blood flow for faster recovery post-match.",
                images: ["https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800"],
                tenantId: ecommerceTenant._id
            }
        ];

        // Clear existing products for this tenant
        await Product.deleteMany({ tenantId: ecommerceTenant._id });

        // Seed for mega-hub too
        const megaHub = await Tenant.findOne({ slug: 'mega-hub' });
        if (megaHub) {
            console.log('Found mega-hub:', megaHub.name);
            const megaProducts = products.map(p => ({
                ...p,
                slug: `mh-${p.slug}`,
                tenantId: megaHub._id
            }));
            await Product.deleteMany({ tenantId: megaHub._id });
            await Product.insertMany(megaProducts);
            console.log('Seeded products for mega-hub');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seedProducts();
