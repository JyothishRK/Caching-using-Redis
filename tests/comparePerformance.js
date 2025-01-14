const Product = require('../models/Product');
const { getAsync, setexAsync, initRedis } = require('../utils/redisClient');

// Function that gets price without caching
async function getPriceWithoutCache(productId) {
    const start = process.hrtime();
    const product = await Product.findById(productId);
    const end = process.hrtime(start);
    const timeInMs = (end[0] * 1000 + end[1] / 1000000).toFixed(2);
    
    return {
        price: product.price,
        time: parseFloat(timeInMs)
    };
}

// Function that gets price with caching
async function getPriceWithCache(productId) {
    const start = process.hrtime();
    
    // Try to get from cache first
    let cachedPrice = await getAsync(`product:${productId}`);
    
    if (!cachedPrice) {
        // If not in cache, get from DB and set cache
        const product = await Product.findById(productId);
        await setexAsync(`product:${productId}`, 300, product.price.toString());
        cachedPrice = product.price;
    }
    
    const end = process.hrtime(start);
    const timeInMs = (end[0] * 1000 + end[1] / 1000000).toFixed(2);
    
    return {
        price: parseFloat(cachedPrice),
        time: parseFloat(timeInMs)
    };
}

async function runComparisonTest() {
    try {
        // Get products from database
        const products = await Product.find({});
        if (products.length === 0) {
            console.log('No products found. Please run seedProducts.js first.');
            return;
        }

        console.log('Starting Performance Comparison Test\n');
        console.log('Testing with products:');
        products.forEach(p => console.log(`- ${p.name} (₹${p.price})`));
        console.log('\n');

        // Clear Redis cache before starting
        await Promise.all(products.map(p => 
            setexAsync(`product:${p._id}`, 0, '')
        ));

        const results = {
            withoutCache: [],
            withCache: []
        };

        // Test without cache
        console.log('Testing without cache...');
        for (let i = 0; i < 10; i++) {
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            const result = await getPriceWithoutCache(randomProduct._id);
            results.withoutCache.push({
                ...result,
                name: randomProduct.name
            });
        }

        // Test with cache
        console.log('Testing with cache...');
        for (let i = 0; i < 10; i++) {
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            const result = await getPriceWithCache(randomProduct._id);
            results.withCache.push({
                ...result,
                name: randomProduct.name
            });
        }

        // Generate report
        console.log('\n=== Performance Comparison Report ===');
        console.log('\nWithout Cache:');
        console.log('--------------');
        results.withoutCache.forEach((r, i) => 
            console.log(`${i + 1}. ${r.name}: ₹${r.price} (${r.time}ms)`)
        );
        
        console.log('\nWith Cache:');
        console.log('----------');
        results.withCache.forEach((r, i) => 
            console.log(`${i + 1}. ${r.name}: ₹${r.price} (${r.time}ms)`)
        );

        // Calculate averages
        const avgWithoutCache = (results.withoutCache
            .reduce((sum, r) => sum + r.time, 0) / results.withoutCache.length).toFixed(2);
        const avgWithCache = (results.withCache
            .reduce((sum, r) => sum + r.time, 0) / results.withCache.length).toFixed(2);

        console.log('\nSummary:');
        console.log('--------');
        console.log(`Average time without cache: ${avgWithoutCache}ms`);
        console.log(`Average time with cache: ${avgWithCache}ms`);
        console.log(`Performance improvement: ${((avgWithoutCache - avgWithCache) / avgWithoutCache * 100).toFixed(2)}%`);

    } catch (error) {
        console.error('Test error:', error);
    } finally {
        process.exit();
    }
}

// Update the main execution
(async () => {
    try {
        // Initialize Redis first
        await initRedis();
        
        // Run the comparison test
        await runComparisonTest();
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        process.exit();
    }
})(); 