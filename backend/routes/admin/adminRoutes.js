import * as yup from 'yup';
import { verifyJWT, restrictTo } from '../auth/middleware.js';
import bcrypt from 'bcrypt';



// Validation schema
const updateUserSchema = yup.object({
    email: yup.string().email(),
    password: yup.string().min(8),
    name: yup.string(),
    role: yup.string().oneOf(['admin', 'manager', 'user']),
    language: yup.string().oneOf(['en', 'fr']),
    permissions: yup.array().of(yup.string().oneOf(['view_products', 'view_inventory', 'view_dashboard'])),
});

export default async function userRoutes(fastify) {
    // Get All Users (Admin)
    fastify.get('/admin/users', {
        preHandler: [verifyJWT, restrictTo(['admin'])],
    }, async (request, reply) => {
        try {
            const users = await User.find({})
                .select('email name role language permissions createdAt updatedAt')
                .lean();
            return reply.send(users);
        } catch (err) {
            console.error('Fetch users error:', err);
            return reply.code(500).send({ error: 'Failed to fetch users', details: err.message });
        }
    });

    // Get Single User (Admin)
    fastify.get('/admin/users/:id', {
        preHandler: [verifyJWT, restrictTo(['admin'])],
    }, async (request, reply) => {
        try {
            const user = await User.findById(request.params.id)
                .select('email name role language permissions createdAt updatedAt')
                .lean();
            if (!user) {
                return reply.code(404).send({ error: 'User not found' });
            }
            return reply.send(user);
        } catch (err) {
            console.error('Fetch user error:', err);
            return reply.code(500).send({ error: 'Failed to fetch user', details: err.message });
        }
    });

    // Update User (Admin)
    fastify.put('/admin/users/:id', {
        preHandler: [
            verifyJWT,
            restrictTo(['admin']),
            async (request, reply) => {
                try {
                    await updateUserSchema.validate(request.body, { abortEarly: false });
                } catch (err) {
                    return reply.code(400).send({ error: 'Invalid input', details: err.errors });
                }
            },
        ],
    }, async (request, reply) => {
        try {
            const { email, password, name, role, language, permissions } = request.body;

            // Prepare update object
            const updateData = {};
            if (email) updateData.email = email;
            if (name) updateData.name = name;
            if (role) updateData.role = role;
            if (language) updateData.language = language;
            if (permissions) updateData.permissions = permissions;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(password, salt);
            }

            if (email) {
                const existingUser = await User.findOne({ email, _id: { $ne: request.params.id } });
                if (existingUser) {
                    return reply.code(400).send({ error: 'Email already in use' });
                }
            }

            // Update user
            const user = await User.findByIdAndUpdate(
                request.params.id,
                { ...updateData, updatedAt: new Date() },
                { new: true }
            ).select('email name role language permissions createdAt updatedAt');

            if (!user) {
                return reply.code(404).send({ error: 'User not found' });
            }

            return reply.send(user);
        } catch (err) {
            console.error('Update user error:', err);
            return reply.code(500).send({ error: 'Failed to update user', details: err.message });
        }
    });

    // Delete User (Admin)
    fastify.delete('/admin/users/:id', {
        preHandler: [verifyJWT, restrictTo(['admin'])],
    }, async (request, reply) => {
        try {
            if (request.user.id === request.params.id) {
                return reply.code(400).send({ error: 'Cannot delete own account' });
            }

            const user = await User.findByIdAndDelete(request.params.id);
            if (!user) {
                return reply.code(404).send({ error: 'User not found' });
            }
            return reply.send({ message: 'User deleted' });
        } catch (err) {
            console.error('Delete user error:', err);
            return reply.code(500).send({ error: 'Failed to delete user', details: err.message });
        }
    });
}