import Product from '../../models/Product.js';
import InventoryMovement from '../../models/InventoryMovement.js';
import * as yup from 'yup';
import { verifyJWT, restrictTo, checkPermissions } from '../auth/middleware.js';



// Validation schemas
const adjustInventorySchema = yup.object({
    productId: yup.string().required(),
    quantity: yup.number().required().notOneOf([0]),
    movementType: yup.string().oneOf(['in', 'out', 'adjustment']).required(),
    reason: yup.string().required(),
});

export default async function inventoryRoutes(fastify) {
    // Get Inventory List (Admin, Manager, User with view_inventory permission)
    fastify.get('/inventory', {
        preHandler: [
            verifyJWT,
            restrictTo(['admin', 'manager', 'user']),
            checkPermissions(['view_inventory']),
        ],
    }, async (request, reply) => {
        try {
            const products = await Product.find({ status: 'active' })
                .select('name sku inventoryQuantity minimumStockLevel')
                .lean();

            const inventory = products.map(product => ({
                ...product,
                lowStock: product.inventoryQuantity <= product.minimumStockLevel,
            }));
            return reply.send(inventory);
        } catch (err) {
            console.error('Fetch inventory error:', err);
            return reply.code(500).send({ error: 'Failed to fetch inventory', details: err.message });
        }
    });

    // Adjust Inventory (Admin, Manager)
    fastify.post('/inventory/adjust', {
        preHandler: [
            verifyJWT,
            restrictTo(['admin', 'manager']),
            async (request, reply) => {
                try {
                    await adjustInventorySchema.validate(request.body, { abortEarly: false });
                } catch (err) {
                    return reply.code(400).send({ error: 'Invalid input', details: err.errors });
                }
            },
        ],
    }, async (request, reply) => {
        try {
            const { productId, quantity, movementType, reason } = request.body;

            // Find product
            const product = await Product.findById(productId);
            if (!product) {
                return reply.code(404).send({ error: 'Product not found' });
            }

            // Calculate new quantity
            const previousQty = product.inventoryQuantity;
            const newQty = movementType === 'in'
                ? previousQty + quantity
                : previousQty - quantity;

            if (newQty < 0) {
                return reply.code(400).send({ error: 'Insufficient inventory for adjustment' });
            }

            // Update product inventory
            product.inventoryQuantity = newQty;
            await product.save();

            // Record movement
            const movement = new InventoryMovement({
                productId,
                movementType,
                quantity: movementType === 'in' ? Math.abs(quantity) : -Math.abs(quantity),
                previousQty,
                newQty,
                reason,
                userId: request.user.id,
            });
            await movement.save();

            return reply.send({ product, movement });
        } catch (err) {
            console.error('Adjust inventory error:', err);
            return reply.code(500).send({ error: 'Failed to adjust inventory', details: err.message });
        }
    });

    // Get Inventory Movement History (Admin, Manager, User with view_inventory permission)
    fastify.get('/inventory/history', {
        preHandler: [
            verifyJWT,
            restrictTo(['admin', 'manager', 'user']),
            checkPermissions(['view_inventory']),
        ],
    }, async (request, reply) => {
        try {
            const { productId, limit = 50, skip = 0 } = request.query;
            const query = productId ? { productId } : {};
            const movements = await InventoryMovement.find(query)
                .populate('productId', 'name sku')
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(parseInt(skip))
                .lean();
            return reply.send(movements);
        } catch (err) {
            console.error('Fetch inventory history error:', err);
            return reply.code(500).send({ error: 'Failed to fetch inventory history', details: err.message });
        }
    });
}