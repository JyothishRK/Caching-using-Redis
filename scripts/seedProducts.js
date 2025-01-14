const Product = require('../models/Product');

async function seedProducts() {
  try {
    // Clear existing products
    await Product.deleteMany({});

    // Create sample products
    const products = await Product.create([
      {
        product_id: 1,
        name: "Laptop",
        category: "Electronics",
        price: 75000,
        stock: 49,
        discount: 10,
        ratings: [5, 4, 3]
      },
      {
        product_id: 2,
        name: "Smartphone",
        category: "Electronics",
        price: 45000,
        stock: 100,
        discount: 5,
        ratings: [4, 4, 5]
      },
      {
        product_id: 3,
        name: "Headphones",
        category: "Electronics",
        price: 2500,
        stock: 200,
        discount: 0,
        ratings: [5, 5]
      }
    ]);

    console.log('Sample products created:', products.map(p => ({id: p._id, name: p.name})));
    process.exit();
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts(); 