"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const constants_1 = require("../utils/constants");
const server_1 = require("../server");
const router = express_1.default.Router();
router.use(auth_1.authMiddleware);
// Get all payments for user
router.get('/', async (req, res) => {
    const userId = req.user.id;
    const { type = 'all' } = req.query;
    try {
        const where = {};
        if (type === 'received') {
            where.sellerId = userId;
        }
        else if (type === 'made') {
            where.buyerId = userId;
        }
        else {
            where.OR = [{ sellerId: userId }, { buyerId: userId }];
        }
        const payments = await database_1.default.payment.findMany({
            where,
            include: {
                invoice: {
                    select: { invoiceNumber: true, totalAmount: true },
                },
                seller: { select: { businessName: true, gstin: true } },
                buyer: { select: { businessName: true, gstin: true } },
            },
            orderBy: { paymentDate: 'desc' },
        });
        const summary = {
            totalPayments: payments.length,
            totalAmount: payments.reduce((sum, p) => sum + Number(p.amount), 0),
        };
        res.json({ payments, summary });
    }
    catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});
// Create payment for an invoice
router.post('/', [
    (0, express_validator_1.body)('invoiceId').isUUID(),
    (0, express_validator_1.body)('amount').isNumeric(),
    (0, express_validator_1.body)('paymentDate').isISO8601(),
    (0, express_validator_1.body)('paymentMode').trim().notEmpty(),
    (0, express_validator_1.body)('referenceNo').optional().trim(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { invoiceId, amount, paymentDate, paymentMode, referenceNo, bankName, notes } = req.body;
    const buyerId = req.user.id;
    try {
        const invoice = await database_1.default.invoice.findUnique({
            where: { id: invoiceId },
            include: { seller: true },
        });
        if (!invoice) {
            res.status(404).json({ error: 'Invoice not found' });
            return;
        }
        // DEMO MODE: Allow both buyer and seller to record payments for demonstration
        // In production, only buyer should be able to make payments
        // if (invoice.buyerId !== buyerId) {
        //   res.status(403).json({ error: 'You can only make payments for invoices issued to you' });
        //   return;
        // }
        const payment = await database_1.default.payment.create({
            data: {
                invoiceId,
                sellerId: invoice.sellerId,
                buyerId,
                amount,
                paymentDate: new Date(paymentDate),
                paymentMode,
                referenceNo,
                bankName,
                notes,
            },
            include: {
                invoice: { select: { invoiceNumber: true } },
                seller: { select: { businessName: true } },
                buyer: { select: { businessName: true } },
            },
        });
        // Update invoice payment status
        const totalPaid = Number(invoice.paidAmount) + Number(amount);
        let paymentStatus = constants_1.PAYMENT_STATUS.PENDING;
        if (totalPaid >= Number(invoice.totalAmount)) {
            paymentStatus = constants_1.PAYMENT_STATUS.PAID;
        }
        else if (totalPaid > 0) {
            paymentStatus = constants_1.PAYMENT_STATUS.PARTIAL;
        }
        await database_1.default.invoice.update({
            where: { id: invoiceId },
            data: {
                paidAmount: totalPaid,
                paymentStatus,
            },
        });
        // Create notification for seller
        await database_1.default.notification.create({
            data: {
                userId: invoice.sellerId,
                type: constants_1.NOTIFICATION_TYPES.PAYMENT_RECEIVED,
                title: 'Payment Received',
                message: `Payment of ₹${Number(amount).toFixed(2)} received for invoice ${invoice.invoiceNumber}`,
                entityType: 'payment',
                entityId: payment.id,
            },
        });
        server_1.io.to(`user_${invoice.sellerId}`).emit('notification', {
            type: constants_1.NOTIFICATION_TYPES.PAYMENT_RECEIVED,
            payment,
        });
        res.status(201).json(payment);
    }
    catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});
// Get payment details
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const payment = await database_1.default.payment.findFirst({
            where: {
                id,
                OR: [{ sellerId: userId }, { buyerId: userId }],
            },
            include: {
                invoice: true,
                seller: { select: { businessName: true, gstin: true } },
                buyer: { select: { businessName: true, gstin: true } },
            },
        });
        if (!payment) {
            res.status(404).json({ error: 'Payment not found' });
            return;
        }
        res.json(payment);
    }
    catch (error) {
        console.error('Get payment error:', error);
        res.status(500).json({ error: 'Failed to fetch payment' });
    }
});
exports.default = router;
//# sourceMappingURL=payments.js.map