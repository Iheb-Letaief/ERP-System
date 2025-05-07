import mongoose from "mongoose";


const inventoryMovementSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    movementType: { type: String, enum: ['in', 'out'] },
    quantity: Number,
    previousQty: Number,
    newQty: Number,
    reason: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });


export default mongoose.model('InventoryMovement', inventoryMovementSchema);