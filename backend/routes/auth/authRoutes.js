import bcrypt from "bcrypt";
import User from "../../models/User.js";
import crypto from "crypto";
import {renderPasswordResetEmail, sendEmail} from "../../services/emailService.js";

export default async function authRoutes(fastify) {
    // User signup
    fastify.post("/signup", async (req, reply) => {
        try {
            const { name, email, password, role } = req.body;

            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return reply.status(400).send({ message: "Email already registered" });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user
            const user = new User({
                name,
                email,
                password: hashedPassword,
                role: ['manager', 'admin', 'user'].includes(role) ? role : 'user',

            });

            await user.save();
            return reply.status(201).send({ message: "User registered successfully" });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: "Server error" });
        }
    });

    // User login
    fastify.post("/login", async (req, reply) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return reply.status(400).send({ message: "Invalid credentials" });
            }

            const token = fastify.jwt.sign(
                { id: user._id, role: user.role },
                { expiresIn: "5d" }
            );

            return reply.send({
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
                token,
            });
        } catch (error) {
            console.error(error);
            return reply.status(500).send({ message: "Server error" });
        }
    });

    // Reset Password
    fastify.post('/reset-password', async (request, reply) => {
        try {
            const { email, language } = request.body;

            // Validate input
            if (!email) {
                return reply.status(400).send({ message: 'Email is required' });
            }

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return reply.status(400).send({ message: 'User not found' });
            }

            // Generate reset token
            const token = crypto.randomBytes(32).toString('hex');
            const tokenExpires = Date.now() + 15 * 60 * 1000; // Expires in 15 minutes

            // Store token in user document
            user.resetToken = token;
            user.resetTokenExpires = tokenExpires;
            await user.save();

            // Render and send reset email
            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
            const { html, subject } = renderPasswordResetEmail({
                resetLink,
                language,
            });

            await sendEmail(email, subject, html);

            return reply.send({ message: 'Password reset email sent' });
        } catch (error) {
            console.error('Reset password error:', error);
            return reply.status(500).send({ message: 'Server error' });
        }
    });

    // Update password
    fastify.post('/update-password', async (request, reply) => {
        try {
            const { token, password } = request.body;

            // Validate input
            if (!token || !password) {
                return reply.status(400).send({ message: 'Token and password are required' });
            }

            // Find user by token and check expiration
            const user = await User.findOne({
                resetToken: token,
                resetTokenExpires: { $gt: Date.now() },
            });

            if (!user) {
                return reply.status(400).send({ message: 'Invalid or expired token' });
            }

            // Update password
            user.password = await bcrypt.hash(password, 10);
            user.resetToken = undefined;
            user.resetTokenExpires = undefined;
            await user.save();

            return reply.send({ message: 'Password updated successfully' });
        } catch (error) {
            console.error('Update password error:', error);
            return reply.status(500).send({ message: 'Server error' });
        }
    });
}
