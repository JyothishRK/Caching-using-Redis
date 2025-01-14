const { getAsync, setexAsync } = require('../utils/redisClient');
const Product = require('../models/Product'); // Assuming you have a Product model

const CACHE_EXPIRATION = 300; // 5 minutes in seconds

async function getProductPrice(productId) {
  try {
    // Try to get price from cache
    const cachedPrice = await getAsync(`product:${productId}`);
    
    if (cachedPrice) {
      return {
        price: parseFloat(cachedPrice),
        source: 'cache'
      };
    }

    // If not in cache, get from MongoDB
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Store in cache with expiration
    await setexAsync(`product:${productId}`, CACHE_EXPIRATION, product.price.toString());

    return {
      price: product.price,
      source: 'database'
    };
  } catch (error) {
    throw error;
  }
}

// Export the function
module.exports = {
  getProductPrice
}; 