import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mjml2html from "mjml";
import * as fs from "node:fs";
import path from "node:path";


dotenv.config();

const templates = {
    todoShared: {
        en: path.resolve("../src/app/templates/todoShared.en.mjml"),
        fr: path.resolve("../src/app/templates/todoShared.fr.mjml"),
    },
    passwordReset: {
        en: path.resolve("../src/app/templates/passwordReset.en.mjml"),
        fr: path.resolve("../src/app/templates/passwordReset.fr.mjml"),
    },
    todoUnshared: {
        en: path.resolve("../src/app/templates/todoUnshared.en.mjml"),
        fr: path.resolve("../src/app/templates/todoUnshared.fr.mjml"),
    },
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    }
});

export const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
        });
        console.log("Email sent to", to);
    } catch (error) {
        console.error("Email sending failed:", error);
    }
}