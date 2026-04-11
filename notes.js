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
// Get all credit/debit notes for user
router.get('/', async (req, res) => {
    const userId = req.user.id;
    const { type = 'all' } = req.query;
    try {
        const where = { sellerId: userId };
        if (type !== 'all')
            where.noteType = type;
        const notes = await database_1.default.creditDebitNote.findMany({
            where,
            include: {
                invoice: { select: { invoiceNumber: true, buyerName: true, buyerGstin: true } },
                seller: { select: { businessName: true, gstin: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(notes);
    }
    catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});
// Create credit/debit note
router.post('/', [
    (0, express_validator_1.body)('invoiceId').isUUID(),
    (0, express_validator_1.body)('noteType').isIn(['CREDIT', 'DEBIT']),
    (0, express_validator_1.body)('reason').trim().notEmpty(),
    (0, express_validator_1.body)('noteDate').isISO8601(),
    (0, express_validator_1.body)('taxableAmount').isNumeric(),
    (0, express_validator_1.body)('totalAmount').isNumeric(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { invoiceId, noteType, reason, noteDate, taxableAmount, cgstAmount = 0, sgstAmount = 0, igstAmount = 0, totalAmount, } = req.body;
    const sellerId = req.user.id;
    try {
        const invoice = await database_1.default.invoice.findFirst({
            where: { id: invoiceId, sellerId },
            include: { buyer: true },
        });
        if (!invoice) {
            res.status(404).json({ error: 'Invoice not found' });
            return;
        }
        // Generate note number
        const noteCount = await database_1.default.creditDebitNote.count({ where: { sellerId } });
        const prefix = noteType === 'CREDIT' ? 'CN' : 'DN';
        const noteNumber = `${prefix}/${new Date().getFullYear()}/${(noteCount + 1).toString().padStart(6, '0')}`;
        const note = await database_1.default.creditDebitNote.create({
            data: {
                noteNumber,
                invoiceId,
                noteType,
                reason,
                noteDate: new Date(noteDate),
                taxableAmount,
                cgstAmount,
                sgstAmount,
                igstAmount,
                totalAmount,
                sellerId,
            },
            include: {
                invoice: { select: { invoiceNumber: true, buyerName: true } },
                seller: { select: { businessName: true } },
            },
        });
        // Notify buyer
        if (invoice.buyerId) {
            const notificationType = noteType === 'CREDIT'
                ? constants_1.NOTIFICATION_TYPES.CREDIT_NOTE_ISSUED
                : constants_1.NOTIFICATION_TYPES.DEBIT_NOTE_ISSUED;
            await database_1.default.notification.create({
                data: {
                    userId: invoice.buyerId,
                    type: notificationType,
                    title: `${noteType === 'CREDIT' ? 'Credit' : 'Debit'} Note Issued`,
                    message: `A ${noteType.toLowerCase()} note of ₹${Number(totalAmount).toFixed(2)} has been issued against invoice ${invoice.invoiceNumber}`,
                    entityType: 'note',
                    entityId: note.id,
                },
            });
            server_1.io.to(`user_${invoice.buyerId}`).emit('notification', {
                type: notificationType,
                note,
            });
        }
        res.status(201).json(note);
    }
    catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
});
// Get note details
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const note = await database_1.default.creditDebitNote.findFirst({
            where: {
                id,
                OR: [{ sellerId: userId }, { invoice: { buyerId: userId } }],
            },
            include: {
                invoice: true,
                seller: { select: { businessName: true, gstin: true } },
            },
        });
        if (!note) {
            res.status(404).json({ error: 'Note not found' });
            return;
        }
        res.json(note);
    }
    catch (error) {
        console.error('Get note error:', error);
        res.status(500).json({ error: 'Failed to fetch note' });
    }
});
exports.default = router;
//# sourceMappingURL=notes.js.map