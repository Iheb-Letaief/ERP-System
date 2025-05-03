const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    sku: { type: String, unique: true },
    category: String,
    subcategory: String,
    costPrice: Number,
    sellingPrice: Number,
    inventoryQty: Number,
    minStockLevel: Number,
    supplierInfo: String,
    imageUrls: [String],
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
}, { timestamps: true });
module.exports = mongoose.model('Product', productSchema);