"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Apply auth and admin role check
router.use(auth_1.authMiddleware);
router.use((0, auth_1.requireRole)(['ADMIN']));
// Dashboard stats
router.get('/dashboard', async (req, res) => {
    try {
        const [totalUsers, totalInvoices, totalInvoicesThisMonth, pendingInvoices, totalPayments, totalRevenue, recentUsers, recentInvoices, disputes,] = await Promise.all([
            database_1.default.user.count(),
            database_1.default.invoice.count(),
            database_1.default.invoice.count({
                where: {
                    createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                },
            }),
            database_1.default.invoice.count({ where: { status: 'PENDING' } }),
            database_1.default.payment.count(),
            database_1.default.payment.aggregate({ _sum: { amount: true } }),
            database_1.default.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, businessName: true, email: true, gstin: true, role: true, createdAt: true },
            }),
            database_1.default.invoice.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    seller: { select: { businessName: true } },
                    buyer: { select: { businessName: true } },
                },
            }),
            database_1.default.invoice.findMany({
                where: { status: { in: ['REJECTED', 'MODIFY_REQUESTED'] } },
                take: 10,
                include: {
                    seller: { select: { businessName: true, email: true } },
                    buyer: { select: { businessName: true, email: true } },
                },
            }),
        ]);
        res.json({
            stats: {
                totalUsers,
                totalInvoices,
                totalInvoicesThisMonth,
                pendingInvoices,
                totalPayments,
                totalRevenue: totalRevenue._sum.amount || 0,
            },
            recentUsers,
            recentInvoices,
            disputes,
        });
    }
    catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});
// Get all users
router.get('/users', async (req, res) => {
    const { search, role, page = '1', limit = '20' } = req.query;
    try {
        const where = {};
        if (search) {
            where.OR = [
                { businessName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { gstin: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role)
            where.role = role;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);
        const [users, total] = await Promise.all([
            database_1.default.user.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            issuedInvoices: true,
                            receivedInvoices: true,
                            paymentsReceived: true,
                            paymentsMade: true,
                        },
                    },
                },
            }),
            database_1.default.user.count({ where }),
        ]);
        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
// Get user details
router.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await database_1.default.user.findUnique({
            where: { id },
            include: {
                issuedInvoices: { take: 5, orderBy: { createdAt: 'desc' } },
                receivedInvoices: { take: 5, orderBy: { createdAt: 'desc' } },
                inventory: { take: 5, orderBy: { createdAt: 'desc' } },
                _count: {
                    select: {
                        issuedInvoices: true,
                        receivedInvoices: true,
                        inventory: true,
                        paymentsReceived: true,
                        paymentsMade: true,
                    },
                },
            },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});
// Update user
router.patch('/users/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const user = await database_1.default.user.update({
            where: { id },
            data: updates,
        });
        res.json(user);
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});
// Get all invoices with filters
router.get('/invoices', async (req, res) => {
    const { status, startDate, endDate, page = '1', limit = '20' } = req.query;
    try {
        const where = {};
        if (status)
            where.status = status;
        if (startDate || endDate) {
            where.invoiceDate = {};
            if (startDate)
                where.invoiceDate.gte = new Date(startDate);
            if (endDate)
                where.invoiceDate.lte = new Date(endDate);
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);
        const [invoices, total] = await Promise.all([
            database_1.default.invoice.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    seller: { select: { businessName: true, gstin: true } },
                    buyer: { select: { businessName: true, gstin: true } },
                    items: { take: 3 },
                },
            }),
            database_1.default.invoice.count({ where }),
        ]);
        res.json({
            invoices,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    }
    catch (error) {
        console.error('Get all invoices error:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});
// Resolve dispute
router.post('/disputes/:invoiceId/resolve', async (req, res) => {
    const { invoiceId } = req.params;
    const { resolution, notes } = req.body;
    try {
        const invoice = await database_1.default.invoice.update({
            where: { id: invoiceId },
            data: {
                status: resolution === 'ACCEPT' ? 'ACCEPTED' : 'PENDING',
                statusReason: notes,
            },
            include: {
                seller: { select: { businessName: true, email: true } },
                buyer: { select: { businessName: true, email: true } },
            },
        });
        // Log activity
        await database_1.default.invoiceActivity.create({
            data: {
                invoiceId,
                action: 'DISPUTE_RESOLVED',
                performedBy: req.user.id,
                performedByRole: 'ADMIN',
                details: JSON.stringify({ resolution, notes }),
            },
        });
        res.json(invoice);
    }
    catch (error) {
        console.error('Resolve dispute error:', error);
        res.status(500).json({ error: 'Failed to resolve dispute' });
    }
});
// Get system analytics
router.get('/analytics', async (req, res) => {
    try {
        // Monthly invoice stats
        const monthlyStats = await database_1.default.$queryRaw `
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as invoice_count,
        SUM("totalAmount") as total_value
      FROM invoices
      WHERE "createdAt" >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `;
        // Top sellers
        const topSellers = await database_1.default.$queryRaw `
      SELECT 
        u."businessName",
        u.gstin,
        COUNT(i.id) as invoice_count,
        SUM(i."totalAmount") as total_value
      FROM users u
      JOIN invoices i ON u.id = i."sellerId"
      WHERE i."createdAt" >= DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY u.id, u."businessName", u.gstin
      ORDER BY total_value DESC
      LIMIT 10
    `;
        // Status distribution
        const statusDistribution = await database_1.default.invoice.groupBy({
            by: ['status'],
            _count: { id: true },
        });
        res.json({
            monthlyStats,
            topSellers,
            statusDistribution,
        });
    }
    catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map