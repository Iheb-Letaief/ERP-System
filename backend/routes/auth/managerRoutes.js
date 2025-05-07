import User from '../../models/User.js';
import * as yup from 'yup';
import { verifyJWT, restrictTo } from './middleware.js';

// Validation schema
const updatePermissionsSchema = yup.object({
    permissions: yup.array().of(yup.string().oneOf(['view_products', 'view_inventory', 'view_dashboard'])).required(),
});

export default async function managerRoutes(fastify) {
    // Update User Permissions
    fastify.put('/manager/users/:id/permissions', {
        preHandler: [
            verifyJWT,
            restrictTo(['manager']),
            async (request, reply) => {
                try {
                    await updatePermissionsSchema.validate(request.body, { abortEarly: false });
                } catch (err) {
                    return reply.code(400).send({ error: 'Invalid input', details: err.errors });
                }
            },
        ],
    }, async (request, reply) => {
        try {
            const { permissions } = request.body;

            // Find user and ensure they are a regular user
            const user = await User.findById(request.params.id);
            if (!user) {
                return reply.code(404).send({ error: 'User not found' });
            }
            if (user.role !== 'user') {
                return reply.code(403).send({ error: 'Can only update permissions for regular users' });
            }

            // Update permissions
            user.permissions = permissions;
            user.updatedAt = new Date();
            await user.save();

            return reply.send({
                email: user.email,
                name: user.name,
                role: user.role,
                language: user.language,
                permissions: user.permissions,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            });
        } catch (err) {
            console.error('Update permissions error:', err);
            return reply.code(500).send({ error: 'Failed to update permissions', details: err.message });
        }
    });
}