"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const gstHelpers_1 = require("../utils/gstHelpers");
const constants_1 = require("../utils/constants");
const server_1 = require("../server");
const router = express_1.default.Router();
// Apply auth middleware to all routes
router.use(auth_1.authMiddleware);
// Get all invoices for logged-in user (issued or received)
router.get('/', [
    (0, express_validator_1.query)('type').optional().isIn(['issued', 'received', 'all']),
    (0, express_validator_1.query)('status').optional(),
    (0, express_validator_1.query)('startDate').optional().isISO8601(),
    (0, express_validator_1.query)('endDate').optional().isISO8601(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { type = 'all', status, startDate, endDate, page = '1', limit = '20', search } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;
    try {
        const where = {};
        // Filter by type (issued/received)
        if (type === 'issued') {
            where.sellerId = userId;
        }
        else if (type === 'received') {
            where.buyerId = userId;
        }
        else {
            // All invoices involving this user
            where.OR = [{ sellerId: userId }, { buyerId: userId }];
        }
        if (status)
            where.status = status;
        if (startDate || endDate) {
            where.invoiceDate = {};
            if (startDate)
                where.invoiceDate.gte = new Date(startDate);
            if (endDate)
                where.invoiceDate.lte = new Date(endDate);
        }
        if (search) {
            where.OR = [
                { invoiceNumber: { contains: search, mode: 'insensitive' } },
                { buyerName: { contains: search, mode: 'insensitive' } },
                { sellerName: { contains: search, mode: 'insensitive' } },
                { buyerGstin: { contains: search, mode: 'insensitive' } },
                { sellerGstin: { contains: search, mode: 'insensitive' } },
            ];
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);
        const [invoices, total] = await Promise.all([
            database_1.default.invoice.findMany({
                where,
                include: {
                    items: true,
                    seller: { select: { id: true, businessName: true, gstin: true, email: true } },
                    buyer: { select: { id: true, businessName: true, gstin: true, email: true } },
                    _count: { select: { notes: true, payments: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            database_1.default.invoice.count({ where }),
        ]);
        // Calculate summary
        const summary = {
            totalInvoices: total,
            totalAmount: invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0),
            pendingCount: invoices.filter((inv) => inv.status === constants_1.INVOICE_STATUS.PENDING).length,
            acceptedCount: invoices.filter((inv) => inv.status === constants_1.INVOICE_STATUS.ACCEPTED).length,
            rejectedCount: invoices.filter((inv) => inv.status === constants_1.INVOICE_STATUS.REJECTED).length,
        };
        res.json({
            invoices,
            summary,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});
// Get single invoice
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const invoice = await database_1.default.invoice.findFirst({
            where: {
                id,
                OR: [{ sellerId: userId }, { buyerId: userId }],
            },
            include: {
                items: true,
                seller: { select: { id: true, businessName: true, gstin: true, email: true, mobile: true, address: true } },
                buyer: { select: { id: true, businessName: true, gstin: true, email: true, mobile: true, address: true } },
                notes: {
                    include: { seller: { select: { businessName: true, gstin: true } } },
                },
                payments: {
                    include: { buyer: { select: { businessName: true } }, seller: { select: { businessName: true } } },
                    orderBy: { paymentDate: 'desc' },
                },
                activities: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!invoice) {
            res.status(404).json({ error: 'Invoice not found' });
            return;
        }
        res.json(invoice);
    }
    catch (error) {
        console.error('Get invoice error:', error);
        res.status(500).json({ error: 'Failed to fetch invoice' });
    }
});
// Create invoice
router.post('/', [
    (0, express_validator_1.body)('invoiceNumber').trim().notEmpty().withMessage('Invoice number is required'),
    (0, express_validator_1.body)('invoiceDate').isISO8601().withMessage('Invalid invoice date'),
    (0, express_validator_1.body)('dueDate').optional().isISO8601().withMessage('Invalid due date'),
    (0, express_validator_1.body)('buyerGstin').isLength({ min: 15, max: 15 }).withMessage('Buyer GSTIN must be exactly 15 characters'),
    (0, express_validator_1.body)('buyerName').trim().notEmpty().withMessage('Buyer name is required'),
    (0, express_validator_1.body)('placeOfSupply').trim().notEmpty().withMessage('Place of supply is required'),
    (0, express_validator_1.body)('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    (0, express_validator_1.body)('items.*.description').trim().notEmpty().withMessage('Item description is required'),
    (0, express_validator_1.body)('items.*.hsnCode').trim().notEmpty().withMessage('HSN code is required'),
    (0, express_validator_1.body)('items.*.quantity').isNumeric().withMessage('Quantity must be a number'),
    (0, express_validator_1.body)('items.*.unitPrice').isNumeric().withMessage('Unit price must be a number'),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { invoiceNumber, invoiceDate, dueDate, buyerGstin, buyerName, buyerAddress, placeOfSupply, reverseCharge = false, items, roundOff = 0, } = req.body;
    const sellerId = req.user.id;
    const sellerGstin = req.user.gstin;
    try {
        // Get seller details
        const seller = await database_1.default.user.findUnique({ where: { id: sellerId } });
        if (!seller) {
            res.status(404).json({ error: 'Seller not found' });
            return;
        }
        // Check if invoice number already exists for this seller
        const existingInvoice = await database_1.default.invoice.findFirst({
            where: { invoiceNumber, sellerId },
        });
        if (existingInvoice) {
            res.status(400).json({ error: 'Invoice number already exists' });
            return;
        }
        // Find buyer by GSTIN
        const buyer = await database_1.default.user.findUnique({
            where: { gstin: buyerGstin.toUpperCase() },
        });
        const sameState = (0, gstHelpers_1.isSameState)(sellerGstin, buyerGstin);
        // Calculate items
        let totalTaxableAmount = 0;
        let totalCgst = 0;
        let totalSgst = 0;
        let totalIgst = 0;
        const invoiceItems = items.map((item) => {
            const taxableValue = (item.quantity * item.unitPrice) - (item.discount || 0);
            const gstCalc = (0, gstHelpers_1.calculateGst)(taxableValue, item.cgstRate || 0, item.sgstRate || 0, item.igstRate || (sameState ? 0 : (item.cgstRate || 0) + (item.sgstRate || 0)), sameState);
            totalTaxableAmount += taxableValue;
            totalCgst += gstCalc.cgstAmount;
            totalSgst += gstCalc.sgstAmount;
            totalIgst += gstCalc.igstAmount;
            return {
                description: item.description,
                hsnCode: item.hsnCode,
                quantity: item.quantity,
                unit: item.unit || 'PCS',
                unitPrice: item.unitPrice,
                discount: item.discount || 0,
                taxableValue,
                cgstRate: sameState ? (item.cgstRate || 0) : 0,
                cgstAmount: gstCalc.cgstAmount,
                sgstRate: sameState ? (item.sgstRate || 0) : 0,
                sgstAmount: gstCalc.sgstAmount,
                igstRate: sameState ? 0 : (item.igstRate || (item.cgstRate || 0) + (item.sgstRate || 0)),
                igstAmount: gstCalc.igstAmount,
                totalAmount: gstCalc.totalAmount,
            };
        });
        const totalTax = totalCgst + totalSgst + totalIgst;
        const totalAmount = totalTaxableAmount + totalTax + (roundOff || 0);
        // Generate mock IRN
        const irn = (0, gstHelpers_1.generateMockIRN)(sellerGstin, invoiceNumber, new Date(invoiceDate));
        const invoice = await database_1.default.invoice.create({
            data: {
                invoiceNumber,
                invoiceDate: new Date(invoiceDate),
                dueDate: dueDate ? new Date(dueDate) : null,
                sellerId,
                sellerGstin: sellerGstin.toUpperCase(),
                sellerName: seller.businessName,
                sellerAddress: seller.address || '',
                buyerId: buyer?.id,
                buyerGstin: buyerGstin.toUpperCase(),
                buyerName,
                buyerAddress: buyerAddress || buyer?.address || '',
                placeOfSupply,
                reverseCharge,
                taxableAmount: totalTaxableAmount,
                cgstAmount: totalCgst,
                sgstAmount: totalSgst,
                igstAmount: totalIgst,
                totalTax,
                totalAmount,
                roundOff: roundOff || 0,
                irn,
                irnGeneratedAt: new Date(),
                items: {
                    create: invoiceItems,
                },
                activities: {
                    create: {
                        action: 'CREATED',
                        performedBy: sellerId,
                        performedByRole: 'SELLER',
                        details: JSON.stringify({ invoiceNumber, totalAmount }),
                    },
                },
            },
            include: {
                items: true,
                seller: { select: { businessName: true, gstin: true } },
                buyer: { select: { businessName: true, gstin: true } },
            },
        });
        // Send notification to buyer if exists
        if (buyer) {
            await database_1.default.notification.create({
                data: {
                    userId: buyer.id,
                    type: constants_1.NOTIFICATION_TYPES.INVOICE_RECEIVED,
                    title: 'New Invoice Received',
                    message: `Invoice ${invoiceNumber} from ${seller.businessName} for ₹${totalAmount.toFixed(2)}`,
                    entityType: 'invoice',
                    entityId: invoice.id,
                },
            });
            // Emit socket event
            server_1.io.to(`user_${buyer.id}`).emit('notification', {
                type: constants_1.NOTIFICATION_TYPES.INVOICE_RECEIVED,
                invoice,
            });
        }
        res.status(201).json(invoice);
    }
    catch (error) {
        console.error('Create invoice error:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
});
// Update invoice status (Accept/Reject/Modify request)
router.patch('/:id/status', [
    (0, express_validator_1.body)('status').isIn(['ACCEPTED', 'REJECTED', 'MODIFY_REQUESTED', 'MISSING_REQUESTED']),
    (0, express_validator_1.body)('reason').optional().trim(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { id } = req.params;
    const { status, reason } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    try {
        const invoice = await database_1.default.invoice.findFirst({
            where: {
                id,
                OR: [{ sellerId: userId }, { buyerId: userId }],
            },
            include: { seller: true, buyer: true, items: true },
        });
        if (!invoice) {
            res.status(404).json({ error: 'Invoice not found' });
            return;
        }
        // DEMO MODE: Allow both buyer and seller to accept/reject for demonstration
        // In production, only buyer should be able to accept/reject
        // if (status === 'ACCEPTED' || status === 'REJECTED') {
        //   if (invoice.buyerId !== userId) {
        //     res.status(403).json({ error: 'Only the buyer can accept or reject invoices' });
        //     return;
        //   }
        // }
        const updateData = { status };
        if (reason)
            updateData.statusReason = reason;
        // If accepted, mark ITC claimable
        if (status === 'ACCEPTED') {
            updateData.itcClaimed = false;
            // Update inventory if linked
            for (const item of invoice.items) {
                if (item.inventoryId) {
                    await database_1.default.inventory.update({
                        where: { id: item.inventoryId },
                        data: {
                            quantity: { increment: item.quantity },
                            lastPurchaseAt: new Date(),
                        },
                    });
                }
            }
        }
        const updatedInvoice = await database_1.default.invoice.update({
            where: { id },
            data: updateData,
            include: {
                items: true,
                seller: { select: { businessName: true, gstin: true } },
                buyer: { select: { businessName: true, gstin: true } },
            },
        });
        // Create activity log
        await database_1.default.invoiceActivity.create({
            data: {
                invoiceId: id,
                action: status,
                performedBy: userId,
                performedByRole: userRole,
                details: JSON.stringify({ reason }),
            },
        });
        // Send notification to other party
        const notifyUserId = invoice.buyerId === userId ? invoice.sellerId : invoice.buyerId;
        if (notifyUserId) {
            const notificationType = status === 'ACCEPTED'
                ? constants_1.NOTIFICATION_TYPES.INVOICE_ACCEPTED
                : status === 'REJECTED'
                    ? constants_1.NOTIFICATION_TYPES.INVOICE_REJECTED
                    : constants_1.NOTIFICATION_TYPES.INVOICE_MODIFIED;
            await database_1.default.notification.create({
                data: {
                    userId: notifyUserId,
                    type: notificationType,
                    title: `Invoice ${status}`,
                    message: `Invoice ${invoice.invoiceNumber} has been ${status.toLowerCase()}${reason ? `: ${reason}` : ''}`,
                    entityType: 'invoice',
                    entityId: invoice.id,
                },
            });
            server_1.io.to(`user_${notifyUserId}`).emit('notification', {
                type: notificationType,
                invoice: updatedInvoice,
            });
        }
        res.json(updatedInvoice);
    }
    catch (error) {
        console.error('Update invoice status error:', error);
        res.status(500).json({ error: 'Failed to update invoice status' });
    }
});
// Update invoice details (seller only, if pending)
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { buyerName, buyerAddress, placeOfSupply, dueDate } = req.body;
    try {
        const invoice = await database_1.default.invoice.findFirst({
            where: {
                id,
                sellerId: userId,
                status: { in: ['PENDING', 'MODIFY_REQUESTED'] },
            },
        });
        if (!invoice) {
            res.status(404).json({ error: 'Invoice not found or cannot be edited' });
            return;
        }
        const updatedInvoice = await database_1.default.invoice.update({
            where: { id },
            data: {
                buyerName: buyerName || invoice.buyerName,
                buyerAddress: buyerAddress !== undefined ? buyerAddress : invoice.buyerAddress,
                placeOfSupply: placeOfSupply || invoice.placeOfSupply,
                dueDate: dueDate ? new Date(dueDate) : invoice.dueDate,
            },
            include: {
                items: true,
                seller: { select: { businessName: true, gstin: true } },
                buyer: { select: { businessName: true, gstin: true } },
            },
        });
        res.json(updatedInvoice);
    }
    catch (error) {
        console.error('Update invoice error:', error);
        res.status(500).json({ error: 'Failed to update invoice' });
    }
});
// Claim ITC
router.post('/:id/claim-itc', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        // DEMO MODE: Allow both buyer and seller to claim ITC for demonstration
        const invoice = await database_1.default.invoice.findFirst({
            where: {
                id,
                OR: [{ buyerId: userId }, { sellerId: userId }], // DEMO: Allow seller too
                status: 'ACCEPTED',
            },
        });
        if (!invoice) {
            res.status(404).json({ error: 'Invoice not found or not eligible for ITC claim' });
            return;
        }
        if (invoice.itcClaimed) {
            res.status(400).json({ error: 'ITC already claimed for this invoice' });
            return;
        }
        const updatedInvoice = await database_1.default.invoice.update({
            where: { id },
            data: {
                itcClaimed: true,
                itcClaimedAt: new Date(),
            },
        });
        res.json(updatedInvoice);
    }
    catch (error) {
        console.error('ITC claim error:', error);
        res.status(500).json({ error: 'Failed to claim ITC' });
    }
});
// Delete invoice (only if pending and seller)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const invoice = await database_1.default.invoice.findFirst({
            where: {
                id,
                sellerId: userId,
                status: { in: ['PENDING', 'MISSING_REQUESTED'] },
            },
        });
        if (!invoice) {
            res.status(404).json({ error: 'Invoice not found or cannot be deleted' });
            return;
        }
        await database_1.default.invoice.delete({ where: { id } });
        res.json({ message: 'Invoice deleted successfully' });
    }
    catch (error) {
        console.error('Delete invoice error:', error);
        res.status(500).json({ error: 'Failed to delete invoice' });
    }
});
exports.default = router;
//# sourceMappingURL=invoices.js.map