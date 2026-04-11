"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const gstHelpers_1 = require("../utils/gstHelpers");
const router = express_1.default.Router();
// Mock IRN generation endpoint
router.post('/generate-irn', [
    (0, express_validator_1.body)('invoiceNumber').trim().notEmpty(),
    (0, express_validator_1.body)('sellerGstin').isLength({ min: 15, max: 15 }),
    (0, express_validator_1.body)('buyerGstin').isLength({ min: 15, max: 15 }),
    (0, express_validator_1.body)('invoiceDate').isISO8601(),
    (0, express_validator_1.body)('totalAmount').isNumeric(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { invoiceNumber, sellerGstin, buyerGstin, invoiceDate, totalAmount } = req.body;
    // Validate GSTINs
    if (!(0, gstHelpers_1.validateGstin)(sellerGstin) || !(0, gstHelpers_1.validateGstin)(buyerGstin)) {
        res.status(400).json({ error: 'Invalid GSTIN format' });
        return;
    }
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Generate mock IRN
    const irn = (0, gstHelpers_1.generateMockIRN)(sellerGstin, invoiceNumber, new Date(invoiceDate));
    // Generate mock QR code data
    const qrData = {
        irn,
        sellerGstin: sellerGstin.toUpperCase(),
        buyerGstin: buyerGstin.toUpperCase(),
        invoiceNumber,
        invoiceDate,
        totalAmount,
        itemCount: 1,
        mainHsnCode: '9999',
    };
    const qrCodeString = Buffer.from(JSON.stringify(qrData)).toString('base64');
    // Mock signature
    const mockSignature = `eyJhbGciOiJFUzI1NiIs...${Buffer.from(irn).toString('base64').substring(0, 50)}`;
    res.json({
        success: true,
        message: 'IRN generated successfully (Mock GSTN)',
        result: {
            irn,
            ackNo: Math.floor(Math.random() * 10000000000).toString(),
            ackDate: new Date().toISOString(),
            signedInvoice: mockSignature,
            signedQRCode: qrCodeString,
            status: 'ACT',
            ewaybillDetails: null,
        },
        warnings: [],
    });
});
// Mock GSTR-2A fetch (purchase view from GSTN)
router.get('/gstr2a', auth_1.authMiddleware, async (req, res) => {
    const { period } = req.query;
    const userGstin = req.user.gstin;
    // Mock response with sample data
    const mockGstr2a = {
        gstin: userGstin,
        fp: period,
        b2b: [
            {
                ctin: '27AABCU9603R1ZX', // Supplier GSTIN
                cfs: 'Y',
                inv: [
                    {
                        inum: 'INV/2024/001',
                        idt: '2024-01-15',
                        val: 118000,
                        pos: '27',
                        rchrg: 'N',
                        inv_typ: 'R',
                        itms: [
                            {
                                num: 1,
                                itm_det: {
                                    ty: 'S',
                                    hsn_sc: '8471',
                                    txval: 100000,
                                    irt: 0,
                                    iamt: 0,
                                    crt: 9,
                                    camt: 9000,
                                    srt: 9,
                                    samt: 9000,
                                },
                            },
                        ],
                    },
                ],
            },
        ],
        cdn: [], // Credit/Debit notes
    };
    res.json({
        success: true,
        message: 'GSTR-2A data fetched successfully (Mock GSTN)',
        data: mockGstr2a,
    });
});
// Mock taxpayer search
router.get('/taxpayer/:gstin', async (req, res) => {
    const { gstin } = req.params;
    if (!(0, gstHelpers_1.validateGstin)(gstin)) {
        res.status(400).json({ error: 'Invalid GSTIN format' });
        return;
    }
    // Mock taxpayer data
    const mockTaxpayer = {
        gstin: gstin.toUpperCase(),
        tradeName: 'Sample Business Enterprises',
        legalName: 'Sample Business Enterprises Pvt Ltd',
        status: 'ACT',
        blkStatus: 'NA',
        state: (0, gstHelpers_1.getStateFromGstin)(gstin),
        registrationDate: '2017-07-01',
        constitution: 'Private Limited Company',
        taxpayerType: 'Regular',
        natureOfBusiness: ['Manufacture', 'Retail', 'Wholesale'],
    };
    res.json({
        success: true,
        message: 'Taxpayer details fetched (Mock GSTN)',
        data: mockTaxpayer,
    });
});
// Mock HSN search
router.get('/hsn/:hsnCode', async (req, res) => {
    const { hsnCode } = req.params;
    // Mock HSN data
    const mockHSN = {
        hsnCode,
        description: hsnCode.startsWith('8471') ? 'Automatic data processing machines' : 'Other goods/services',
        gstRate: 18,
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 18,
    };
    res.json({
        success: true,
        message: 'HSN details fetched (Mock GSTN)',
        data: mockHSN,
    });
});
// Mock e-Invoice schema validation
router.post('/validate-einvoice', async (req, res) => {
    const invoice = req.body;
    const errors = [];
    const warnings = [];
    // Basic validation
    if (!invoice.sellerGstin || invoice.sellerGstin.length !== 15) {
        errors.push('Invalid seller GSTIN');
    }
    if (!invoice.buyerGstin || invoice.buyerGstin.length !== 15) {
        errors.push('Invalid buyer GSTIN');
    }
    if (!invoice.items || invoice.items.length === 0) {
        errors.push('At least one item is required');
    }
    res.json({
        valid: errors.length === 0,
        errors,
        warnings,
    });
});
exports.default = router;
//# sourceMappingURL=mockGstn.js.map