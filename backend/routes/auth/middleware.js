const {verify} = require("jsonwebtoken");


module.exports = async (request, reply) => {
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) return reply.code(401).send({ error: 'Unauthorized' });
    try {
        request.user = verify(token, process.env.JWT_SECRET);
    } catch {
        reply.code(401).send({ error: 'Invalid token' });
    }
};