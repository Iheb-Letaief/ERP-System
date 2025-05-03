import dotenv from "dotenv";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { connectDB } from "./db-connector.js";
import authRoutes from "./routes/auth/authRoutes.js";
import fastifyJwt from "@fastify/jwt";


dotenv.config();

// Initialize Fastify
const fastify = Fastify({ logger: true });

// Connect to MongoDB
connectDB().then(r => console.log(r));

// Register Middleware
fastify.register(cors, {
    origin: "*",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: "*",
});

fastify.register(fastifyJwt, {
    secret: process.env.NEXTAUTH_SECRET,
    sign: { expiresIn: "5d" }
});

// fastify.register(require('fastify-cors'));
// fastify.register(require('fastify-helmet'));

// Register Routes
fastify.register(authRoutes, { prefix: "/api/auth" });


// Start Server
const start = async () => {
    try {
        await fastify.listen({ port: 5000 });
        console.log("Server running on http://localhost:5000");
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start().then(r => console.log(r));