"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.generateOtpEmailTemplate = generateOtpEmailTemplate;
exports.generateInvoiceSharedEmailTemplate = generateInvoiceSharedEmailTemplate;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
async function sendEmail(to, subject, html) {
    if (process.env.NODE_ENV === 'development' || !process.env.SMTP_USER) {
        console.log('Email would be sent:', { to, subject, html });
        return;
    }
    try {
        await transporter.sendMail({
            from: `"GST Invoice Hub" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
    }
    catch (error) {
        console.error('Email sending failed:', error);
    }
}
function generateOtpEmailTemplate(otp, name) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a56db;">GST Invoice Hub - OTP Verification</h2>
      <p>Hello ${name},</p>
      <p>Your One-Time Password (OTP) for GST Invoice Hub is:</p>
      <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr style="margin-top: 30px;" />
      <p style="color: #6b7280; font-size: 12px;">GST Invoice Hub - HackHorizon 2K26</p>
    </div>
  `;
}
function generateInvoiceSharedEmailTemplate(invoiceNumber, sellerName, amount, link) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a56db;">New Invoice Received</h2>
      <p>You have received a new invoice from <strong>${sellerName}</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Invoice Number</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>Amount</strong></td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">₹${amount.toFixed(2)}</td>
        </tr>
      </table>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="background: #1a56db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Invoice</a>
      </div>
      <p style="color: #6b7280; font-size: 12px;">GST Invoice Hub - HackHorizon 2K26</p>
    </div>
  `;
}
//# sourceMappingURL=email.js.map