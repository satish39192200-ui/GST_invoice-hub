"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../config/database"));
const router = express_1.default.Router();
router.use(auth_1.authMiddleware);
// Get all notifications for user
router.get('/', async (req, res) => {
    const userId = req.user.id;
    const { unreadOnly = 'false', limit = '50' } = req.query;
    try {
        const notifications = await database_1.default.notification.findMany({
            where: {
                userId,
                ...(unreadOnly === 'true' ? { isRead: false } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
        });
        const unreadCount = await database_1.default.notification.count({
            where: { userId, isRead: false },
        });
        res.json({ notifications, unreadCount });
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});
// Mark notification as read
router.patch('/:id/read', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const notification = await database_1.default.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
        if (notification.count === 0) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }
        res.json({ message: 'Notification marked as read' });
    }
    catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});
// Mark all notifications as read
router.patch('/read-all', async (req, res) => {
    const userId = req.user.id;
    try {
        await database_1.default.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
});
// Delete notification
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const deleted = await database_1.default.notification.deleteMany({
            where: { id, userId },
        });
        if (deleted.count === 0) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }
        res.json({ message: 'Notification deleted' });
    }
    catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map