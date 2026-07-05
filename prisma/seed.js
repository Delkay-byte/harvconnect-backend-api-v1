const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Hackathon2026!";

// Realistic Ghanaian names for Greater Accra and Ashanti regions
const GHANAIAN_NAMES = {
  farmers: [
    { fullName: "Kwame Mensah", email: "kwame.mensah@harvconnect.com" },
    { fullName: "Ama Serwaa", email: "ama.serwaa@harvconnect.com" },
    { fullName: "Kofi Asante", email: "kofi.asante@harvconnect.com" },
    { fullName: "Yaa Afriyie", email: "yaa.afriyie@harvconnect.com" },
    { fullName: "Emmanuel Osei", email: "emmanuel.osei@harvconnect.com" },
  ],
  buyers: [
    { fullName: "Abena Ofori", email: "abena.ofori@harvconnect.com" },
    { fullName: "Samuel Addo", email: "samuel.addo@harvconnect.com" },
    { fullName: "Grace Agyeman", email: "grace.agyeman@harvconnect.com" },
  ],
  transporters: [
    { fullName: "Isaac Boateng", email: "isaac.boateng@harvconnect.com" },
    { fullName: "Dorcas Mensah", email: "dorcas.mensah@harvconnect.com" },
  ],
};

// GPS coordinates for Greater Accra and Ashanti regions (MVP focus areas)
const LOCATIONS = {
  greaterAccra: [
    {
      latitude: 5.6037,
      longitude: -0.187,
      address: "Accra Central, Greater Accra",
    },
    { latitude: 5.6415, longitude: -0.2441, address: "Tema, Greater Accra" },
    { latitude: 5.56, longitude: -0.205, address: "Madina, Greater Accra" },
    {
      latitude: 5.6144,
      longitude: -0.1769,
      address: "Achimota, Greater Accra",
    },
  ],
  ashanti: [
    {
      latitude: 6.6931,
      longitude: -1.6244,
      address: "Kumasi Central, Ashanti",
    },
    { latitude: 6.6885, longitude: -1.6228, address: "Adum, Kumasi" },
    { latitude: 6.695, longitude: -1.63, address: "Kejetia Market, Kumasi" },
  ],
};

// Realistic vegetable commodities with Ghanaian market prices (in GHS)
// Note: Units must match valid units: KG, BAG, CRATE, BUNCH, BOX, PIECE
const COMMODITIES = [
  {
    name: "Fresh Tomatoes (Basket)",
    category: "TOMATO_LOCAL",
    price: 150.0,
    unit: "BAG",
  },
  {
    name: "Hybrid Tomatoes (Crate)",
    category: "TOMATO_HYBRID",
    price: 180.0,
    unit: "CRATE",
  },
  { name: "Spicy Green Peppers", category: "PEPPER", price: 80.0, unit: "KG" },
  {
    name: "Garden Eggs (Sack)",
    category: "GARDEN_EGGS",
    price: 120.0,
    unit: "BAG",
  },
  { name: "Fresh Okra", category: "OKRA", price: 60.0, unit: "KG" },
  { name: "Cabbage Head", category: "CABBAGE", price: 45.0, unit: "PIECE" },
  { name: "Fresh Lettuce", category: "LETTUCE", price: 35.0, unit: "BUNCH" },
  { name: "Cucumber", category: "CUCUMBER", price: 55.0, unit: "KG" },
  { name: "Onions (Bag)", category: "ONION", price: 200.0, unit: "BAG" },
];

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function main() {
  console.log("🌱 Starting seed process...");
  console.log(
    "📍 Seeding data for Greater Accra and Ashanti regions (MVP focus)",
  );

  const hashedPassword = await hashPassword(DEMO_PASSWORD);

  await prisma.$transaction(
    async (tx) => {
      console.log("🧹 Cleaning existing demo data...");

      // Delete in order respecting foreign key constraints
      await tx.order.deleteMany();
      await tx.review.deleteMany();
      await tx.product.deleteMany();
      await tx.transportProfile.deleteMany();
      await tx.buyerProfile.deleteMany();
      await tx.farmerProfile.deleteMany();
      await tx.authToken.deleteMany();

      // Delete demo users by email
      await tx.user.deleteMany({
        where: {
          email: {
            in: [
              ...GHANAIAN_NAMES.farmers.map((f) => f.email),
              ...GHANAIAN_NAMES.buyers.map((b) => b.email),
              ...GHANAIAN_NAMES.transporters.map((t) => t.email),
            ],
          },
        },
      });

      console.log("👨‍🌾 Creating farmers (Greater Accra & Ashanti)...");
      const farmers = [];

      // Create 3 farmers in Greater Accra
      for (let i = 0; i < 3; i++) {
        const farmerData = GHANAIAN_NAMES.farmers[i];
        const location = LOCATIONS.greaterAccra[i];

        const farmer = await tx.user.create({
          data: {
            fullName: farmerData.fullName,
            email: farmerData.email,
            phone: `+233${2000000000 + i}`,
            password: hashedPassword,
            role: "FARMER",
            isVerified: true,
            emailVerifiedAt: new Date(),
          },
        });

        await tx.farmerProfile.create({
          data: {
            userId: farmer.id,
            farmName: `${farmerData.fullName.split(" ")[0]}'s Farm`,
            bio: "Experienced vegetable farmer serving Greater Accra and Ashanti regions with fresh, quality produce.",
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
          },
        });

        farmers.push(farmer);
        console.log(
          `  ✓ Created farmer: ${farmerData.fullName} (${location.address})`,
        );
      }

      // Create 2 farmers in Ashanti
      for (let i = 0; i < 2; i++) {
        const farmerData = GHANAIAN_NAMES.farmers[i + 3];
        const location = LOCATIONS.ashanti[i];

        const farmer = await tx.user.create({
          data: {
            fullName: farmerData.fullName,
            email: farmerData.email,
            phone: `+233${2000000000 + i + 3}`,
            password: hashedPassword,
            role: "FARMER",
            isVerified: true,
            emailVerifiedAt: new Date(),
          },
        });

        await tx.farmerProfile.create({
          data: {
            userId: farmer.id,
            farmName: `${farmerData.fullName.split(" ")[0]}'s Farm`,
            bio: "Specializing in quality vegetables for Ashanti and Greater Accra markets.",
            address: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
          },
        });

        farmers.push(farmer);
        console.log(
          `  ✓ Created farmer: ${farmerData.fullName} (${location.address})`,
        );
      }

      // Keep this legacy account so the older transport and order integration tests don't break
      await tx.user.create({
        data: {
          fullName: "Legacy Test Farmer",
          email: "farmer@test.com",
          password:
            "$2a$12$7MD02fSNbkZeDXyJmgGRGeBWQFpm4SB853KfwBXEQdOp3CMopWvZi",
          role: "FARMER",
          isVerified: true,
          emailVerifiedAt: new Date("2026-07-05T21:51:11.976Z"),
          phone: "0240000000",
        },
      });
      console.log(`  ✓ Created legacy test farmer: farmer@test.com`);

      console.log("🛒 Creating buyers (Greater Accra)...");
      const buyers = [];
      for (let i = 0; i < GHANAIAN_NAMES.buyers.length; i++) {
        const buyerData = GHANAIAN_NAMES.buyers[i];
        const location = LOCATIONS.greaterAccra[i];

        const buyer = await tx.user.create({
          data: {
            fullName: buyerData.fullName,
            email: buyerData.email,
            phone: `+233${2400000000 + i}`,
            password: hashedPassword,
            role: "BUYER",
            isVerified: true,
            emailVerifiedAt: new Date(),
          },
        });

        await tx.buyerProfile.create({
          data: {
            userId: buyer.id,
            deliveryAddress: location.address,
            latitude: location.latitude,
            longitude: location.longitude,
          },
        });

        buyers.push(buyer);
        console.log(
          `  ✓ Created buyer: ${buyerData.fullName} (${location.address})`,
        );
      }

      console.log("🚚 Creating transporters...");
      for (let i = 0; i < GHANAIAN_NAMES.transporters.length; i++) {
        const transporterData = GHANAIAN_NAMES.transporters[i];
        const location =
          i === 0 ? LOCATIONS.greaterAccra[0] : LOCATIONS.ashanti[0];

        const transporter = await tx.user.create({
          data: {
            fullName: transporterData.fullName,
            email: transporterData.email,
            phone: `+233${2500000000 + i}`,
            password: hashedPassword,
            role: "TRANSPORT",
            isVerified: true,
            emailVerifiedAt: new Date(),
          },
        });

        await tx.transportProfile.create({
          data: {
            userId: transporter.id,
            vehicleType: i === 0 ? "PICKUP" : "MINI_TRUCK",
            capacity: i === 0 ? 500.0 : 1000.0,
            isAvailable: true,
            currentAddress: location.address,
            currentRegion: i === 0 ? "Greater Accra" : "Ashanti",
            currentLat: location.latitude,
            currentLng: location.longitude,
          },
        });

        console.log(
          `  ✓ Created transporter: ${transporterData.fullName} (${location.address})`,
        );
      }

      console.log(
        "🥬 Creating products with realistic quantities and prices...",
      );
      // Create specific products for each farmer with deterministic data
      const productData = [
        {
          farmerIdx: 0,
          name: "Fresh Tomatoes (Basket)",
          category: "TOMATO_LOCAL",
          price: 150.0,
          unit: "BAG",
          quantity: 20,
        },
        {
          farmerIdx: 0,
          name: "Spicy Green Peppers",
          category: "PEPPER",
          price: 80.0,
          unit: "KG",
          quantity: 15,
        },
        {
          farmerIdx: 0,
          name: "Fresh Okra",
          category: "OKRA",
          price: 60.0,
          unit: "KG",
          quantity: 30,
        },
        {
          farmerIdx: 1,
          name: "Garden Eggs (Sack)",
          category: "GARDEN_EGGS",
          price: 120.0,
          unit: "BAG",
          quantity: 10,
        },
        {
          farmerIdx: 1,
          name: "Fresh Tomatoes (Basket)",
          category: "TOMATO_LOCAL",
          price: 150.0,
          unit: "BAG",
          quantity: 25,
        },
        {
          farmerIdx: 1,
          name: "Cabbage Head",
          category: "CABBAGE",
          price: 45.0,
          unit: "PIECE",
          quantity: 35,
        },
        {
          farmerIdx: 2,
          name: "Hybrid Tomatoes (Crate)",
          category: "TOMATO_HYBRID",
          price: 180.0,
          unit: "CRATE",
          quantity: 15,
        },
        {
          farmerIdx: 2,
          name: "Fresh Lettuce",
          category: "LETTUCE",
          price: 35.0,
          unit: "BUNCH",
          quantity: 40,
        },
        {
          farmerIdx: 2,
          name: "Cucumber",
          category: "CUCUMBER",
          price: 55.0,
          unit: "KG",
          quantity: 25,
        },
        {
          farmerIdx: 3,
          name: "Onions (Bag)",
          category: "ONION",
          price: 200.0,
          unit: "BAG",
          quantity: 12,
        },
        {
          farmerIdx: 3,
          name: "Garden Eggs (Sack)",
          category: "GARDEN_EGGS",
          price: 120.0,
          unit: "BAG",
          quantity: 18,
        },
        {
          farmerIdx: 3,
          name: "Fresh Okra",
          category: "OKRA",
          price: 60.0,
          unit: "KG",
          quantity: 28,
        },
        {
          farmerIdx: 4,
          name: "Spicy Green Peppers",
          category: "PEPPER",
          price: 80.0,
          unit: "KG",
          quantity: 22,
        },
        {
          farmerIdx: 4,
          name: "Fresh Tomatoes (Basket)",
          category: "TOMATO_LOCAL",
          price: 150.0,
          unit: "BAG",
          quantity: 16,
        },
        {
          farmerIdx: 4,
          name: "Cabbage Head",
          category: "CABBAGE",
          price: 45.0,
          unit: "PIECE",
          quantity: 30,
        },
      ];

      for (const prod of productData) {
        const farmer = farmers[prod.farmerIdx];
        await tx.product.create({
          data: {
            farmerId: farmer.id,
            name: prod.name,
            category: prod.category,
            quantity: prod.quantity,
            price: prod.price,
            unit: prod.unit,
            description: `Fresh ${prod.name} from ${farmer.fullName}'s farm in ${
              LOCATIONS.greaterAccra[prod.farmerIdx]?.address ||
              LOCATIONS.ashanti[prod.farmerIdx - 3]?.address
            }. Harvested recently and ready for delivery.`,
            available: true,
            harvestDate: new Date(
              Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000,
            ), // Harvested within last 3 days
          },
        });
      }
      console.log(`  ✓ Created ${productData.length} products`);

      console.log("⭐ Creating sample reviews...");
      // Create reviews from buyers to farmers
      const reviewComments = [
        "Excellent quality produce, very fresh!",
        "Great service and timely delivery.",
        "Highly recommended farmer.",
        "Consistent quality every time.",
        "Best tomatoes in the market!",
      ];

      let reviewCount = 0;
      for (let i = 0; i < buyers.length; i++) {
        // Each buyer reviews 2-3 farmers
        const numReviews = 2 + Math.floor(Math.random() * 2);
        for (let j = 0; j < numReviews && j < farmers.length; j++) {
          const rating = 4 + Math.floor(Math.random() * 2); // 4 or 5 stars
          await tx.review.create({
            data: {
              buyerId: buyers[i].id,
              farmerId: farmers[j].id,
              rating: rating,
              comment:
                reviewComments[
                  Math.floor(Math.random() * reviewComments.length)
                ],
            },
          });
          reviewCount++;
        }
      }
      console.log(`  ✓ Created ${reviewCount} reviews`);

      console.log("📦 Creating sample orders...");
      const products = await tx.product.findMany({ take: 5 });
      let orderCount = 0;
      for (let i = 0; i < Math.min(3, products.length); i++) {
        const product = products[i];
        const buyer = buyers[i % buyers.length];

        await tx.order.create({
          data: {
            orderNumber: `ORD-${Date.now()}-${i}`,
            buyerId: buyer.id,
            farmerId: product.farmerId,
            productId: product.id,
            quantity: 5,
            totalPrice: Number(product.price) * 5,
            pickupAddress: "Farm Location",
            deliveryAddress: LOCATIONS.greaterAccra[0].address,
            status: "DELIVERED",
          },
        });
        orderCount++;
      }
      console.log(`  ✓ Created ${orderCount} orders`);
    },
    {
      maxWait: 5000, // Give Prisma 5 seconds to connect to the database
      timeout: 20000, // I am giving this transaction a full 20 seconds to complete instead of 5
    },
  );

  console.log("\n✅ Seed completed successfully!");
  console.log("=".repeat(60));
  console.log(`📧 Demo password for all accounts: ${DEMO_PASSWORD}`);
  console.log("=".repeat(60));
  console.log("\n👨‍🌾 Farmers (Greater Accra & Ashanti):");
  GHANAIAN_NAMES.farmers.forEach((f) => console.log(`   ${f.email}`));
  console.log("\n🛒 Buyers (Greater Accra):");
  GHANAIAN_NAMES.buyers.forEach((b) => console.log(`   ${b.email}`));
  console.log("\n🚚 Transporters:");
  GHANAIAN_NAMES.transporters.forEach((t) => console.log(`   ${t.email}`));
  console.log("\n💡 All accounts are verified and ready to use!");
  console.log(
    "📍 Focus regions: Greater Accra (Accra, Tema, Madina) & Ashanti (Kumasi)",
  );
}

main()
  .catch((e) => {
    console.error("\n❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
