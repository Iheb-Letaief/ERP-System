import Product from '../../models/Product.js';
import { verifyJWT, restrictTo, checkPermissions } from '../auth/middleware.js';



export default async function dashboardRoutes(fastify) {
    // Get Dashboard Statistics (Admin, Manager, User with view_dashboard permission)
    fastify.get('/dashboard/stats', {
        preHandler: [
            verifyJWT,
            restrictTo(['admin', 'manager', 'user']),
            checkPermissions(['view_dashboard']),
        ],
    }, async (request, reply) => {
        try {
            // Total number of products
            const totalProducts = await Product.countDocuments({ status: 'active' });

            // Number of products with low stock
            const lowStockProducts = await Product.countDocuments({
                status: 'active',
                $expr: { $lte: ["$inventoryQuantity", "$minimumStockLevel"] }
            });

            // Total inventory value
            const inventoryAggregate = await Product.aggregate([
                { $match: { status: 'active' } },
                {
                    $group: {
                        _id: null,
                        totalValue: { $sum: { $multiply: ['$sellingPrice', '$inventoryQuantity'] } },
                    },
                },
            ]);
            const totalInventoryValue = inventoryAggregate[0]?.totalValue || 0;

            // Recently added products (last 5, sorted by createdAt descending)
            const recentProducts = await Product.find({ status: 'active' })
                .select('name sku sellingPrice createdAt')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            return reply.send({
                totalProducts,
                lowStockProducts,
                totalInventoryValue,
                recentProducts,
            });
        } catch (err) {
            console.error('Fetch dashboard stats error:', err);
            return reply.code(500).send({ error: 'Failed to fetch dashboard stats', details: err.message });
        }
    });
}