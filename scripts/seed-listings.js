const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/turfbooking";

async function seedListings() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db();

        const tenantData = [
            { slug: "single-turf", title: "Elite FIFA Pro Turf", type: "turf", price: 1500, city: "Bangalore" },
            { slug: "resort-and-turf", title: "Royal Orchid Hotel & Turf", type: "multi", price: 5000, city: "Goa" },
            { slug: "mega-hub", title: "Mega Sports Stadium & Gear", type: "multi", price: 2000, city: "Mumbai" }
        ];

        for (const td of tenantData) {
            const tenant = await db.collection('tenants').findOne({ slug: td.slug });
            if (tenant) {
                // Remove existing to avoid duplicates if re-running
                await db.collection('listings').deleteMany({ tenantId: tenant._id });

                await db.collection('listings').insertOne({
                    title: td.title,
                    description: `Experience world-class ${td.type} facilities at ${td.title}. We offer premium amenities and professional support.`,
                    type: td.type === 'multi' ? 'turf' : td.type, // Sub-type
                    priceConfig: { basePrice: td.price, pricingModel: "per_slot" },
                    location: { city: td.city, address: `Sector 4, ${td.city} Center` },
                    tenantId: tenant._id,
                    isActive: true,
                    isFeatured: true,
                    images: ["https://images.unsplash.com/photo-1540747913346-19e32dc3e97e"],
                    capacity: 15,
                    createdAt: new Date()
                });
                console.log(`Added listing for ${td.slug}`);
            }
        }

    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await client.close();
        process.exit();
    }
}

seedListings();
