import Product from '../../models/Product.js';
import * as yup from 'yup';
import verifyJWT from '../auth/middleware.js';

// Role-based access control middleware
const restrictTo = (roles) => {
    return async (request, reply) => {
        const user = request.user;
        if (!roles.includes(user.role)) {
            return reply.code(403).send({ error: 'Forbidden: Insufficient permissions' });
        }
    };
};

// Permission check middleware for users
const checkPermissions = (permissions) => {
    return async (request, reply) => {
        const user = await require('../../models/User').findById(request.user.id);
        if (user.role === 'user' && !permissions.every(perm => user.permissions.includes(perm))) {
            return reply.code(403).send({ error: 'Forbidden: Insufficient permissions' });
        }
    };
};

// Validation schemas
const createProductSchema = yup.object({
    name: yup.string().required(),
    description: yup.string().required(),
    sku: yup.string().required(),
    category: yup.string().required(),
    subcategory: yup.string().required(),
    costPrice: yup.number().positive().required(),
    sellingPrice: yup.number().positive().required(),
    inventoryQuantity: yup.number().min(0).required(),
    minimumStockLevel: yup.number().min(0).required(),
    supplierInfo: yup.object({
        name: yup.string().required(),
        contact: yup.string().required(),
    }).required(),
    imageUrls: yup.array().of(yup.string().url()),
    status: yup.string().oneOf(['active', 'archived']).default('active'),
    variants: yup.array().of(
        yup.object({
            name: yup.string().required(),
            value: yup.string().required(),
            additionalPrice: yup.number().min(0).required(),
        })
    ),
});

const updateProductSchema = yup.object({
    name: yup.string(),
    description: yup.string(),
    sku: yup.string(),
    category: yup.string(),
    subcategory: yup.string(),
    costPrice: yup.number().positive(),
    sellingPrice: yup.number().positive(),
    inventoryQuantity: yup.number().min(0),
    minimumStockLevel: yup.number().min(0),
    supplierInfo: yup.object({
        name: yup.string(),
        contact: yup.string(),
    }),
    imageUrls: yup.array().of(yup.string().url()),
    status: yup.string().oneOf(['active', 'archived']),
    variants: yup.array().of(
        yup.object({
            name: yup.string().required(),
            value: yup.string().required(),
            additionalPrice: yup.number().min(0).required(),
        })
    ),
});

const variantSchema = yup.object({
    name: yup.string().required(),
    value: yup.string().required(),
    additionalPrice: yup.number().min(0).required(),
});

export default async function productRoutes(fastify) {
    // Create Product (Admin, Manager)
    fastify.post('/products', {
        preHandler: [
            verifyJWT,
            restrictTo(['admin', 'manager']),
            async (request, reply) => {
                try {
                    await createProductSchema.validate(request.body, { abortEarly: false });
                } catch (err) {
                    return reply.code(400).send({ error: 'Invalid input', details: err.errors });
                }
            },
        ],
    }, async (request, reply) => {
        try {
            const product = new Product(request.body);
            await product.save();
            return reply.code(201).send(product);
        } catch (err) {
            console.error('Create product error:', err);
            return reply.code(500).send({ error: 'Failed to create product', details: err.message });
        }
    });

    // Get All Products (Admin, Manager, User with view_products permission)
    fastify.get('/products', {
        preHandler: [
            verifyJWT,
            restrictTo(['admin', 'manager', 'user']),
            checkPermissions(['view_products']),
        ],
    }, async (request, reply) => {
        try {
            const products = await Product.find({}).lean();
            return reply.send(products);
        } catch (err) {
            console.error('Fetch products error:', err);
            return reply.code(500).send({ error: 'Failed to fetch products', details: err.message });
        }
    });

    // Get Single Product (Admin, Manager, User with view_products permission)
    fastify.get('/products/:id', {
        preHandler: [
            verifyJWT,
            restrictTo(['admin', 'manager', 'user']),
            checkPermissions(['view_products']),
        ],
    }, async (request, reply) => {
        try {
            const product = await Product.findById(request.params.id).lean();
            if (!product) {
                return reply.code(404).send({ error: 'Product not found' });
            }
            return reply.send(product);
        } catch (err) {
            console.error('Fetch product error:', err);
            return reply.code(500).send({ error: 'Failed to fetch product', details: err.message });
        }
    });

    // Update Product (Admin, Manager)
    fastify.put('/products/:id', {
        preHandler: [
            verifyJWT,
            restrictTo(['admin', 'manager']),
            async (request, reply) => {
                try {
                    await updateProductSchema.validate(request.body, { abortEarly: false });
                } catch (err) {
                    return reply.code(400).send({ error: 'Invalid input', details: err.errors });
                }
            },
        ],
    }, async (request, reply) => {
        try {
            const product = await Product.findByIdAndUpdate(
                request.params.id,
                { ...request.body, updatedAt: new Date() },
                { new: true }
            );
            if (!product) {
                return reply.code(404).send({ error: 'Product not found' });
            }
            return reply.send(product);
        } catch (err) {
            console.error('Update product error:', err);
            return reply.code(500).send({ error: 'Failed to update product', details: err.message });
        }
    });

    // Delete Product (Admin)
    fastify.delete('/products/:id', {
        preHandler: [
            verifyJWT,
            restrictTo(['admin'])
        ],
    }, async (request, reply) => {
        try {
            const product = await Product.findByIdAndDelete(request.params.id);
            if (!product) {
                return reply.code(404).send({ error: 'Product not found' });
            }
            return reply.send({ message: 'Product deleted' });
        } catch (err) {
            console.error('Delete product error:', err);
            return reply.code(500).send({ error: 'Failed to delete product', details: err.message });
        }
    });

    // Add Product Variant (Admin, Manager)
    fastify.post('/products/:id/variants', {
        preHandler: [
            verifyJWT,
            restrictTo(['admin', 'manager']),
            async (request, reply) => {
                try {
                    await variantSchema.validate(request.body, { abortEarly: false });
                } catch (err) {
                    return reply.code(400).send({ error: 'Invalid input', details: err.errors });
                }
            },
        ],
    }, async (request, reply) => {
        try {
            const product = await Product.findById(request.params.id);
            if (!product) {
                return reply.code(404).send({ error: 'Product not found' });
            }
            product.variants.push(request.body);
            await product.save();
            return reply.send(product);
        } catch (err) {
            console.error('Add variant error:', err);
            return reply.code(500).send({ error: 'Failed to add variant', details: err.message });
        }
    });

    // Delete Product Variant (Admin, Manager)
    fastify.delete('/products/:id/variants/:variantId', {
        preHandler: [
            verifyJWT,
            restrictTo(['admin', 'manager'])
        ],
    }, async (request, reply) => {
        try {
            const product = await Product.findById(request.params.id);
            if (!product) {
                return reply.code(404).send({ error: 'Product not found' });
            }
            product.variants = product.variants.filter(
                (variant) => variant._id.toString() !== request.params.variantId
            );
            await product.save();
            return reply.send(product);
        } catch (err) {
            console.error('Delete variant error:', err);
            return reply.code(500).send({ error: 'Failed to delete variant', details: err.message });
        }
    });
};