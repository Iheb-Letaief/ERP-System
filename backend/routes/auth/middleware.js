import pkg from 'jsonwebtoken';
const { verify } = pkg;
import User from '../../models/User.js';



export const verifyJWT = async (request, reply) => {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) return reply.code(401).send({ error: 'Unauthorized' });
    try {
        request.user = verify(token, process.env.NEXTAUTH_SECRET);
    } catch {
        reply.code(401).send({ error: 'Invalid token' });
    }
};


// Role-based access control middleware
export const restrictTo = (roles) => {
    return async (request, reply) => {
        const user = request.user;
        if (!roles.includes(user.role)) {
            return reply.code(403).send({ error: 'Forbidden: Insufficient permissions' });
        }
    };
};


// Permission check middleware for users
export const checkPermissions = (permissions) => {
    return async (request, reply) => {
        const user = await User.findById(request.user.id);
        if (user.role === 'user' && !permissions.every(perm => user.permissions.includes(perm))) {
            return reply.code(403).send({ error: 'Forbidden: Insufficient permissions' });
        }
    };
};

export default verifyJWT;