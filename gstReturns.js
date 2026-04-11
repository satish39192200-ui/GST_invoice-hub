"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const express_validator_2 = require("express-validator");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const gstHelpers_1 = require("../utils/gstHelpers");
const router = express_1.default.Router();
router.use(auth_1.authMiddleware);
// Generate GSTR-1 summary
router.get('/gstr1', [
    (0, express_validator_1.query)('period').matches(/^\d{2}-\d{4}$/), // MM-YYYY format
], async (req, res) => {
    const errors = (0, express_validator_2.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { period } = req.query;
    const userId = req.user.id;
    const userGstin = req.user.gstin;
    try {
        const { start, end } = (0, gstHelpers_1.parsePeriod)(period);
        // Get all issued invoices for this period
        const invoices = await database_1.default.invoice.findMany({
            where: {
                sellerId: userId,
                invoiceDate: { gte: start, lte: end },
                status: { in: ['ACCEPTED', 'PENDING'] },
            },
            include: { items: true },
            orderBy: { invoiceDate: 'asc' },
        });
        // Calculate summary
        let totalTaxableValue = 0;
        let totalCgst = 0;
        let totalSgst = 0;
        let totalIgst = 0;
        let totalInvoiceValue = 0;
        const b2bInvoices = invoices.map((inv) => {
            totalTaxableValue += Number(inv.taxableAmount);
            totalCgst += Number(inv.cgstAmount);
            totalSgst += Number(inv.sgstAmount);
            totalIgst += Number(inv.igstAmount);
            totalInvoiceValue += Number(inv.totalAmount);
            return {
                invoiceNumber: inv.invoiceNumber,
                invoiceDate: inv.invoiceDate,
                buyerGstin: inv.buyerGstin,
                buyerName: inv.buyerName,
                invoiceValue: Number(inv.totalAmount),
                taxableValue: Number(inv.taxableAmount),
                cgst: Number(inv.cgstAmount),
                sgst: Number(inv.sgstAmount),
                igst: Number(inv.igstAmount),
                placeOfSupply: inv.placeOfSupply,
                reverseCharge: inv.reverseCharge,
                irn: inv.irn,
            };
        });
        const summary = {
            period: period,
            totalInvoices: invoices.length,
            totalTaxableValue: Math.round(totalTaxableValue * 100) / 100,
            totalCgst: Math.round(totalCgst * 100) / 100,
            totalSgst: Math.round(totalSgst * 100) / 100,
            totalIgst: Math.round(totalIgst * 100) / 100,
            totalInvoiceValue: Math.round(totalInvoiceValue * 100) / 100,
            b2bInvoices,
        };
        // Save or update GST return record
        await database_1.default.gstReturn.upsert({
            where: {
                userId_returnType_period: {
                    userId,
                    returnType: 'GSTR1',
                    period: period,
                },
            },
            update: {
                summaryData: summary,
            },
            create: {
                userId,
                returnType: 'GSTR1',
                period: period,
                summaryData: summary,
            },
        });
        res.json(summary);
    }
    catch (error) {
        console.error('GSTR1 generation error:', error);
        res.status(500).json({ error: 'Failed to generate GSTR-1' });
    }
});
// Generate GSTR-3B summary
router.get('/gstr3b', [
    (0, express_validator_1.query)('period').matches(/^\d{2}-\d{4}$/), // MM-YYYY format
], async (req, res) => {
    const errors = (0, express_validator_2.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { period } = req.query;
    const userId = req.user.id;
    const userGstin = req.user.gstin;
    try {
        const { start, end } = (0, gstHelpers_1.parsePeriod)(period);
        // Get all invoices for this period (issued and received)
        const [issuedInvoices, receivedInvoices] = await Promise.all([
            database_1.default.invoice.findMany({
                where: {
                    sellerId: userId,
                    invoiceDate: { gte: start, lte: end },
                    status: { in: ['ACCEPTED', 'PENDING'] },
                },
            }),
            database_1.default.invoice.findMany({
                where: {
                    buyerId: userId,
                    invoiceDate: { gte: start, lte: end },
                    status: 'ACCEPTED',
                },
            }),
        ]);
        // Calculate outward supplies (sales)
        let outwardTaxableSupplies = 0;
        let outwardZeroRated = 0;
        let outwardNilExempt = 0;
        let outwardNonGst = 0;
        issuedInvoices.forEach((inv) => {
            if (inv.reverseCharge) {
                outwardNonGst += Number(inv.taxableAmount);
            }
            else if (Number(inv.totalTax) === 0) {
                outwardNilExempt += Number(inv.taxableAmount);
            }
            else {
                outwardTaxableSupplies += Number(inv.taxableAmount);
            }
        });
        // Calculate inward supplies (purchases) and ITC
        let inwardTaxableSupplies = 0;
        let itcAvailableCgst = 0;
        let itcAvailableSgst = 0;
        let itcAvailableIgst = 0;
        receivedInvoices.forEach((inv) => {
            inwardTaxableSupplies += Number(inv.taxableAmount);
            if (inv.itcClaimed) {
                itcAvailableCgst += Number(inv.cgstAmount);
                itcAvailableSgst += Number(inv.sgstAmount);
                itcAvailableIgst += Number(inv.igstAmount);
            }
        });
        // Calculate net ITC and tax payable
        const netItcCgst = itcAvailableCgst;
        const netItcSgst = itcAvailableSgst;
        const netItcIgst = itcAvailableIgst;
        // Calculate tax on outward supplies
        let taxPayableCgst = 0;
        let taxPayableSgst = 0;
        let taxPayableIgst = 0;
        issuedInvoices.forEach((inv) => {
            const sameState = (0, gstHelpers_1.isSameState)(userGstin, inv.buyerGstin);
            if (sameState) {
                taxPayableCgst += Number(inv.cgstAmount);
                taxPayableSgst += Number(inv.sgstAmount);
            }
            else {
                taxPayableIgst += Number(inv.igstAmount);
            }
        });
        const summary = {
            period: period,
            outwardTaxableSupplies: Math.round(outwardTaxableSupplies * 100) / 100,
            outwardZeroRated: Math.round(outwardZeroRated * 100) / 100,
            outwardNilExempt: Math.round(outwardNilExempt * 100) / 100,
            outwardNonGst: Math.round(outwardNonGst * 100) / 100,
            inwardTaxableSupplies: Math.round(inwardTaxableSupplies * 100) / 100,
            inwardZeroRated: 0,
            inwardNilExempt: 0,
            inwardNonGst: 0,
            itcAvailableCgst: Math.round(itcAvailableCgst * 100) / 100,
            itcAvailableSgst: Math.round(itcAvailableSgst * 100) / 100,
            itcAvailableIgst: Math.round(itcAvailableIgst * 100) / 100,
            itcReversedCgst: 0,
            itcReversedSgst: 0,
            itcReversedIgst: 0,
            netItcCgst: Math.round(netItcCgst * 100) / 100,
            netItcSgst: Math.round(netItcSgst * 100) / 100,
            netItcIgst: Math.round(netItcIgst * 100) / 100,
            taxPayableCgst: Math.round(taxPayableCgst * 100) / 100,
            taxPayableSgst: Math.round(taxPayableSgst * 100) / 100,
            taxPayableIgst: Math.round(taxPayableIgst * 100) / 100,
            taxPaidCgst: Math.max(0, Math.round((taxPayableCgst - netItcCgst) * 100) / 100),
            taxPaidSgst: Math.max(0, Math.round((taxPayableSgst - netItcSgst) * 100) / 100),
            taxPaidIgst: Math.max(0, Math.round((taxPayableIgst - netItcIgst) * 100) / 100),
        };
        // Save or update GST return record
        await database_1.default.gstReturn.upsert({
            where: {
                userId_returnType_period: {
                    userId,
                    returnType: 'GSTR3B',
                    period: period,
                },
            },
            update: {
                summaryData: summary,
            },
            create: {
                userId,
                returnType: 'GSTR3B',
                period: period,
                summaryData: summary,
            },
        });
        res.json(summary);
    }
    catch (error) {
        console.error('GSTR3B generation error:', error);
        res.status(500).json({ error: 'Failed to generate GSTR-3B' });
    }
});
// Export GSTR-1 as CSV
router.get('/gstr1/export', async (req, res) => {
    const { period } = req.query;
    const userId = req.user.id;
    try {
        const gstReturn = await database_1.default.gstReturn.findUnique({
            where: {
                userId_returnType_period: {
                    userId,
                    returnType: 'GSTR1',
                    period: period,
                },
            },
        });
        if (!gstReturn) {
            res.status(404).json({ error: 'GSTR-1 not generated yet. Please generate first.' });
            return;
        }
        const summary = gstReturn.summaryData;
        // Generate CSV
        const headers = [
            'Invoice Number',
            'Invoice Date',
            'Buyer GSTIN',
            'Buyer Name',
            'Invoice Value',
            'Taxable Value',
            'CGST',
            'SGST',
            'IGST',
            'Place of Supply',
            'Reverse Charge',
            'IRN',
        ].join(',');
        const rows = summary.b2bInvoices.map((inv) => [
            inv.invoiceNumber,
            new Date(inv.invoiceDate).toISOString().split('T')[0],
            inv.buyerGstin,
            `"${inv.buyerName}"`,
            inv.invoiceValue.toFixed(2),
            inv.taxableValue.toFixed(2),
            inv.cgst.toFixed(2),
            inv.sgst.toFixed(2),
            inv.igst.toFixed(2),
            inv.placeOfSupply,
            inv.reverseCharge ? 'Y' : 'N',
            inv.irn || '',
        ].join(','));
        const csv = [headers, ...rows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="GSTR1_${period}.csv"`);
        res.send(csv);
    }
    catch (error) {
        console.error('GSTR1 export error:', error);
        res.status(500).json({ error: 'Failed to export GSTR-1' });
    }
});
// Get GST return history
router.get('/history', async (req, res) => {
    const userId = req.user.id;
    try {
        const returns = await database_1.default.gstReturn.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(returns);
    }
    catch (error) {
        console.error('Get returns history error:', error);
        res.status(500).json({ error: 'Failed to fetch returns history' });
    }
});
exports.default = router;
//# sourceMappingURL=gstReturns.js.map