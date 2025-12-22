const { User, Category, Subcategory, ServiceRequest } = require("../models");
const bcrypt = require("bcryptjs");

/**
 * Seed database with sample data
 */
async function seedDatabase() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // Create Admin User (Garage Owner)
    console.log("Creating admin user...");
    const adminPassword = await bcrypt.hash("password123", 10);
    const admin = await User.create({
      name: "Mike Johnson",
      email: "admin@garage.com",
      password: adminPassword,
      phone: "+1234567890",
      role: "admin",
      garageName: "Mike's Auto Repair",
      garageAddress: "123 Main Street, New York, NY 10001",
      garageLatitude: 40.73061,
      garageLongitude: -73.935242,
      businessLicense: "BL123456",
      serviceRadius: 15,
      isActive: true,
      isVerified: true,
    });
    console.log("✓ Admin user created:", admin.email);

    // Create Customer User
    console.log("\nCreating customer user...");
    const customerPassword = await bcrypt.hash("password123", 10);
    const customer = await User.create({
      name: "John Doe",
      email: "customer@example.com",
      password: customerPassword,
      phone: "+1987654321",
      role: "customer",
      isActive: true,
      isVerified: true,
    });
    console.log("✓ Customer user created:", customer.email);

    // Create Categories
    console.log("\nCreating categories...");
    const categories = await Category.bulkCreate([
      {
        name: "Engine Repair",
        slug: "engine-repair",
        description:
          "Complete engine diagnostic, repair, and maintenance services",
        isActive: true,
        sortOrder: 1,
        createdBy: admin.id,
      },
      {
        name: "Tire Services",
        slug: "tire-services",
        description: "Tire repair, replacement, rotation, and balancing",
        isActive: true,
        sortOrder: 2,
        createdBy: admin.id,
      },
      {
        name: "Battery Services",
        slug: "battery-services",
        description: "Battery testing, charging, and replacement",
        isActive: true,
        sortOrder: 3,
        createdBy: admin.id,
      },
      {
        name: "Brake Services",
        slug: "brake-services",
        description: "Brake inspection, repair, and replacement",
        isActive: true,
        sortOrder: 4,
        createdBy: admin.id,
      },
      {
        name: "Oil & Fluids",
        slug: "oil-fluids",
        description: "Oil changes and fluid top-ups",
        isActive: true,
        sortOrder: 5,
        createdBy: admin.id,
      },
      {
        name: "Electrical System",
        slug: "electrical-system",
        description: "Electrical diagnostics and repairs",
        isActive: true,
        sortOrder: 6,
        createdBy: admin.id,
      },
    ]);
    console.log(`✓ Created ${categories.length} categories`);

    // Create Subcategories
    console.log("\nCreating subcategories...");
    const subcategories = await Subcategory.bulkCreate([
      // Engine Repair subcategories
      {
        name: "Engine Diagnostics",
        slug: "engine-diagnostics",
        description: "Complete engine diagnostic scan and report",
        categoryId: categories[0].id,
        estimatedDuration: 45,
        priceMin: 50,
        priceMax: 100,
        isActive: true,
        sortOrder: 1,
        createdBy: admin.id,
      },
      {
        name: "Engine Tune-Up",
        slug: "engine-tune-up",
        description: "Complete engine tune-up service",
        categoryId: categories[0].id,
        estimatedDuration: 90,
        priceMin: 150,
        priceMax: 300,
        isActive: true,
        sortOrder: 2,
        createdBy: admin.id,
      },
      {
        name: "Overheating Repair",
        slug: "overheating-repair",
        description: "Engine overheating diagnosis and repair",
        categoryId: categories[0].id,
        estimatedDuration: 120,
        priceMin: 200,
        priceMax: 500,
        isActive: true,
        sortOrder: 3,
        createdBy: admin.id,
      },
      // Tire Services subcategories
      {
        name: "Flat Tire Repair",
        slug: "flat-tire-repair",
        description: "Flat tire repair or replacement",
        categoryId: categories[1].id,
        estimatedDuration: 30,
        priceMin: 25,
        priceMax: 75,
        isActive: true,
        sortOrder: 1,
        createdBy: admin.id,
      },
      {
        name: "Tire Replacement",
        slug: "tire-replacement",
        description: "New tire installation",
        categoryId: categories[1].id,
        estimatedDuration: 45,
        priceMin: 100,
        priceMax: 300,
        isActive: true,
        sortOrder: 2,
        createdBy: admin.id,
      },
      {
        name: "Tire Rotation & Balance",
        slug: "tire-rotation-balance",
        description: "Tire rotation and wheel balancing",
        categoryId: categories[1].id,
        estimatedDuration: 40,
        priceMin: 40,
        priceMax: 80,
        isActive: true,
        sortOrder: 3,
        createdBy: admin.id,
      },
      // Battery Services subcategories
      {
        name: "Battery Jump Start",
        slug: "battery-jump-start",
        description: "Emergency battery jump start service",
        categoryId: categories[2].id,
        estimatedDuration: 20,
        priceMin: 30,
        priceMax: 60,
        isActive: true,
        sortOrder: 1,
        createdBy: admin.id,
      },
      {
        name: "Battery Testing",
        slug: "battery-testing",
        description: "Complete battery health test",
        categoryId: categories[2].id,
        estimatedDuration: 15,
        priceMin: 0,
        priceMax: 25,
        isActive: true,
        sortOrder: 2,
        createdBy: admin.id,
      },
      {
        name: "Battery Replacement",
        slug: "battery-replacement",
        description: "New battery installation",
        categoryId: categories[2].id,
        estimatedDuration: 30,
        priceMin: 100,
        priceMax: 250,
        isActive: true,
        sortOrder: 3,
        createdBy: admin.id,
      },
      // Brake Services subcategories
      {
        name: "Brake Inspection",
        slug: "brake-inspection",
        description: "Complete brake system inspection",
        categoryId: categories[3].id,
        estimatedDuration: 30,
        priceMin: 0,
        priceMax: 50,
        isActive: true,
        sortOrder: 1,
        createdBy: admin.id,
      },
      {
        name: "Brake Pad Replacement",
        slug: "brake-pad-replacement",
        description: "Brake pad replacement service",
        categoryId: categories[3].id,
        estimatedDuration: 60,
        priceMin: 150,
        priceMax: 350,
        isActive: true,
        sortOrder: 2,
        createdBy: admin.id,
      },
      {
        name: "Brake Fluid Change",
        slug: "brake-fluid-change",
        description: "Brake fluid flush and replacement",
        categoryId: categories[3].id,
        estimatedDuration: 45,
        priceMin: 80,
        priceMax: 150,
        isActive: true,
        sortOrder: 3,
        createdBy: admin.id,
      },
      // Oil & Fluids subcategories
      {
        name: "Oil Change",
        slug: "oil-change",
        description: "Standard oil change service",
        categoryId: categories[4].id,
        estimatedDuration: 30,
        priceMin: 40,
        priceMax: 100,
        isActive: true,
        sortOrder: 1,
        createdBy: admin.id,
      },
      {
        name: "Synthetic Oil Change",
        slug: "synthetic-oil-change",
        description: "Premium synthetic oil change",
        categoryId: categories[4].id,
        estimatedDuration: 35,
        priceMin: 70,
        priceMax: 150,
        isActive: true,
        sortOrder: 2,
        createdBy: admin.id,
      },
      {
        name: "Coolant Flush",
        slug: "coolant-flush",
        description: "Complete coolant system flush",
        categoryId: categories[4].id,
        estimatedDuration: 45,
        priceMin: 80,
        priceMax: 140,
        isActive: true,
        sortOrder: 3,
        createdBy: admin.id,
      },
      // Electrical System subcategories
      {
        name: "Alternator Repair",
        slug: "alternator-repair",
        description: "Alternator diagnosis and repair",
        categoryId: categories[5].id,
        estimatedDuration: 90,
        priceMin: 200,
        priceMax: 500,
        isActive: true,
        sortOrder: 1,
        createdBy: admin.id,
      },
      {
        name: "Starter Motor Repair",
        slug: "starter-motor-repair",
        description: "Starter motor diagnosis and repair",
        categoryId: categories[5].id,
        estimatedDuration: 75,
        priceMin: 150,
        priceMax: 400,
        isActive: true,
        sortOrder: 2,
        createdBy: admin.id,
      },
      {
        name: "Headlight Replacement",
        slug: "headlight-replacement",
        description: "Headlight bulb or assembly replacement",
        categoryId: categories[5].id,
        estimatedDuration: 30,
        priceMin: 50,
        priceMax: 200,
        isActive: true,
        sortOrder: 3,
        createdBy: admin.id,
      },
    ]);
    console.log(`✓ Created ${subcategories.length} subcategories`);

    // Create Sample Service Requests
    console.log("\nCreating sample service requests...");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const serviceRequests = await ServiceRequest.bulkCreate([
      {
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        categoryId: categories[2].id, // Battery Services
        subcategoryId: subcategories[6].id, // Battery Jump Start
        addressStreet: "456 Oak Street",
        addressCity: "New York",
        addressState: "NY",
        addressZipCode: "10002",
        addressFull: "456 Oak Street, New York, NY 10002",
        locationLatitude: 40.73561,
        locationLongitude: -73.945242,
        addressPin: "Near the blue building, parking lot entrance",
        preferredDate: tomorrow.toISOString().split("T")[0],
        preferredTime: "10:00 AM",
        description:
          "My car won't start. The battery seems completely dead. Need urgent help!",
        images: "[]",
        status: "pending",
        priority: "high",
        notes: "[]",
        statusHistory: "[]",
      },
      {
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        categoryId: categories[4].id, // Oil & Fluids
        subcategoryId: subcategories[12].id, // Oil Change
        addressStreet: "789 Elm Avenue",
        addressCity: "New York",
        addressState: "NY",
        addressZipCode: "10003",
        addressFull: "789 Elm Avenue, New York, NY 10003",
        locationLatitude: 40.740612,
        locationLongitude: -73.950243,
        addressPin: "Apartment complex, visitor parking",
        preferredDate: nextWeek.toISOString().split("T")[0],
        preferredTime: "2:00 PM",
        description:
          "Regular oil change needed. Car has about 5,000 miles since last change.",
        images: "[]",
        status: "pending",
        priority: "medium",
        notes: "[]",
        statusHistory: "[]",
      },
      {
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        categoryId: categories[1].id, // Tire Services
        subcategoryId: subcategories[3].id, // Flat Tire Repair
        addressStreet: "321 Pine Road",
        addressCity: "Brooklyn",
        addressState: "NY",
        addressZipCode: "11201",
        addressFull: "321 Pine Road, Brooklyn, NY 11201",
        locationLatitude: 40.694613,
        locationLongitude: -73.990244,
        addressPin: "Street parking in front of house",
        preferredDate: today.toISOString().split("T")[0],
        preferredTime: "4:00 PM",
        description:
          "Got a flat tire on the way home. Tire is completely flat, might need replacement.",
        images: "[]",
        status: "pending",
        priority: "urgent",
        notes: "[]",
        statusHistory: "[]",
      },
    ]);
    console.log(`✓ Created ${serviceRequests.length} sample service requests`);

    console.log("\n✅ Database seeding completed successfully!\n");
    console.log("📋 Summary:");
    console.log(`   Users: ${2} (1 admin, 1 customer)`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Subcategories: ${subcategories.length}`);
    console.log(`   Service Requests: ${serviceRequests.length}`);
    console.log("\n🔑 Test Credentials:");
    console.log("   Admin:");
    console.log("     Email: admin@garage.com");
    console.log("     Password: password123");
    console.log("   Customer:");
    console.log("     Email: customer@example.com");
    console.log("     Password: password123\n");

    return {
      admin,
      customer,
      categories,
      subcategories,
      serviceRequests,
    };
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  const { connectDB, closeDB } = require("../config/database");

  connectDB()
    .then(() => seedDatabase())
    .then(() => {
      console.log("🎉 Seeding complete! You can now use the application.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
