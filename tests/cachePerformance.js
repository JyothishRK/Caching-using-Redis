const { getProductPrice } = require('../services/productPriceService');
const Product = require('../models/Product');

async function runPerformanceTest() {
  // Get actual products from database
  const products = await Product.find({});
  const productIds = products.map(p => p._id.toString());

  if (productIds.length === 0) {
    console.log('No products found in database. Please run seedProducts.js first.');
    process.exit(1);
  }

  console.log('Starting Cache Performance Test\n');
  console.log('Available Products:');
  products.forEach(p => {
    console.log(`- ${p.name} (ID: ${p._id}, Price: ₹${p.price})`);
  });
  
  const results = {
    cached: [],
    uncached: []
  };

  // Run 10 lookups
  for (let i = 0; i < 10; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    
    const start = process.hrtime();
    const result = await getProductPrice(randomProduct._id);
    const end = process.hrtime(start);
    
    const timeInMs = (end[0] * 1000 + end[1] / 1000000).toFixed(2);
    
    results[result.source === 'cache' ? 'cached' : 'uncached'].push(parseFloat(timeInMs));
  }

  // Generate report
  console.log('Performance Report:');
  console.log('-----------------');
  console.log(`Total Lookups: 10`);
  console.log(`Cached Lookups: ${results.cached.length}`);
  console.log(`Uncached Lookups: ${results.uncached.length}`);
  console.log('\nResponse Times (ms):');
  console.log(`Cached Avg: ${average(results.cached).toFixed(2)} ms`);
  console.log(`Uncached Avg: ${average(results.uncached).toFixed(2)} ms`);
}

function average(arr) {
  return arr.length ? arr.reduce((a, b) => a + b) / arr.length : 0;
}

runPerformanceTest().catch(console.error); 