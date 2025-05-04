import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
    language: { type: String, default: 'en' },
    permissions: [{ type: String }],


    resetToken: { type: String },
    resetTokenExpires: { type: Number },
}, { timestamps: true });


export default mongoose.model('User', userSchema);