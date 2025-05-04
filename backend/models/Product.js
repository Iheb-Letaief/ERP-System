import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    inventoryQuantity: { type: Number, required: true, min: 0 },
    minimumStockLevel: { type: Number, required: true, min: 0 },
    supplierInfo: {
        name: { type: String, required: true },
        contact: { type: String, required: true },
    },
    imageUrls: [{ type: String }],
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    variants: [{
        name: { type: String, required: true },
        value: { type: String, required: true },
        additionalPrice: { type: Number, required: true, min: 0 },
    }],
}, { timestamps: true });

export default mongoose.model('Product', productSchema);