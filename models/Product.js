const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

const productSchema = new mongoose.Schema({
  product_id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  ratings: [{
    type: Number
  }]
});

module.exports = mongoose.model('Product', productSchema); 