import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mjml2html from "mjml";
import * as fs from "node:fs";
import path from "node:path";


dotenv.config();

const templates = {
    passwordReset: {
        en: path.resolve("../frontend/src/app/templates/passwordReset.en.mjml"),
        fr: path.resolve("../frontend/src/app/templates/passwordReset.fr.mjml"),
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


const renderEmail = (templatePath, data) => {
    try {
        const mjmlTemplate = fs.readFileSync(templatePath, "utf-8");

        // Replace placeholders
        let mjmlContent = mjmlTemplate;

        if (data.resetLink) {
            mjmlContent = mjmlContent.replace("{{RESET_LINK}}", data.resetLink || "#");        }

        const { html, errors } = mjml2html(mjmlContent, { validationLevel: "strict" });
        if (errors.length) {
            console.error(`MJML rendering errors for ${templatePath}:`, errors);
        }

        return html;
    } catch (error) {
        console.error(`Error rendering MJML template ${templatePath}:`, error);
        throw error;
    }
};


export const renderPasswordResetEmail = ({ resetLink, language = "en" }) => {
    if (!["en", "fr"].includes(language)) language = "en";
    const templatePath = templates.passwordReset[language];
    const html = renderEmail(templatePath, { resetLink });
    const subject = language === "fr" ? "Demande de réinitialisation de mot de passe - ERP-Sys" : "Password Reset Request - ERP-Sys";
    return { html, subject };
};