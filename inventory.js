"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authMiddleware);
// Get inventory for user
router.get('/', async (req, res) => {
    const userId = req.user.id;
    const { lowStock, search } = req.query;
    try {
        const where = { userId };
        if (lowStock === 'true') {
            where.quantity = { lte: database_1.default.inventory.fields.reorderLevel };
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { hsnCode: { contains: search, mode: 'insensitive' } },
            ];
        }
        const inventory = await database_1.default.inventory.findMany({
            where,
            orderBy: { name: 'asc' },
        });
        const summary = {
            totalItems: inventory.length,
            totalValue: inventory.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.purchasePrice)), 0),
            lowStockItems: inventory.filter((item) => Number(item.quantity) <= Number(item.reorderLevel)).length,
        };
        res.json({ inventory, summary });
    }
    catch (error) {
        console.error('Get inventory error:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});
// Create inventory item
router.post('/', [
    (0, express_validator_1.body)('name').trim().notEmpty(),
    (0, express_validator_1.body)('hsnCode').trim().notEmpty(),
    (0, express_validator_1.body)('quantity').isNumeric(),
    (0, express_validator_1.body)('unit').trim().notEmpty(),
    (0, express_validator_1.body)('purchasePrice').isNumeric(),
    (0, express_validator_1.body)('salePrice').isNumeric(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { name, hsnCode, description, quantity, unit, reorderLevel = 0, purchasePrice, salePrice, cgstRate = 9, sgstRate = 9, igstRate = 18, } = req.body;
    const userId = req.user.id;
    try {
        const existingItem = await database_1.default.inventory.findUnique({
            where: { userId_hsnCode: { userId, hsnCode } },
        });
        if (existingItem) {
            res.status(400).json({ error: 'Item with this HSN code already exists' });
            return;
        }
        const item = await database_1.default.inventory.create({
            data: {
                userId,
                name,
                hsnCode,
                description,
                quantity,
                unit,
                reorderLevel,
                purchasePrice,
                salePrice,
                cgstRate,
                sgstRate,
                igstRate,
            },
        });
        res.status(201).json(item);
    }
    catch (error) {
        console.error('Create inventory error:', error);
        res.status(500).json({ error: 'Failed to create inventory item' });
    }
});
// Update inventory item
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;
    try {
        const item = await database_1.default.inventory.findFirst({
            where: { id, userId },
        });
        if (!item) {
            res.status(404).json({ error: 'Inventory item not found' });
            return;
        }
        const updatedItem = await database_1.default.inventory.update({
            where: { id },
            data: updates,
        });
        res.json(updatedItem);
    }
    catch (error) {
        console.error('Update inventory error:', error);
        res.status(500).json({ error: 'Failed to update inventory' });
    }
});
// Update stock quantity
router.post('/:id/adjust-stock', async (req, res) => {
    const { id } = req.params;
    const { quantity, reason } = req.body;
    const userId = req.user.id;
    try {
        const item = await database_1.default.inventory.findFirst({
            where: { id, userId },
        });
        if (!item) {
            res.status(404).json({ error: 'Inventory item not found' });
            return;
        }
        const newQuantity = Math.max(0, Number(item.quantity) + Number(quantity));
        const updatedItem = await database_1.default.inventory.update({
            where: { id },
            data: { quantity: newQuantity },
        });
        res.json(updatedItem);
    }
    catch (error) {
        console.error('Adjust stock error:', error);
        res.status(500).json({ error: 'Failed to adjust stock' });
    }
});
// Delete inventory item
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const item = await database_1.default.inventory.findFirst({
            where: { id, userId },
        });
        if (!item) {
            res.status(404).json({ error: 'Inventory item not found' });
            return;
        }
        await database_1.default.inventory.delete({ where: { id } });
        res.json({ message: 'Inventory item deleted' });
    }
    catch (error) {
        console.error('Delete inventory error:', error);
        res.status(500).json({ error: 'Failed to delete inventory item' });
    }
});
exports.default = router;
//# sourceMappingURL=inventory.js.map