const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    },
});

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email content in HTML
 * @param {string} [options.from] - Optional sender email (defaults to NODEMAILER_USER)
 */
const sendEmail = async ({ to, subject, html, from }) => {
    console.log("calling sendEmail-------------");
    const mailOptions = {
        from: from || `"No Reply" <${process.env.NODEMAILER_USER}>`,
        to,
        subject,
        html,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
