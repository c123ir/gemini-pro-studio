"use strict";
// backend/src/routes/messages.ts
// مسیرهای مربوط به پیام‌ها
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
/**
 * @route   POST /api/v1/messages
 * @desc    ارسال پیام جدید
 * @access  Private
 */
router.post('/', (req, res) => {
    // TODO: پیاده‌سازی ارسال پیام جدید
    res.json({ message: 'پیام جدید ارسال شد' });
});
/**
 * @route   GET /api/v1/messages/:id
 * @desc    دریافت جزئیات یک پیام
 * @access  Private
 */
router.get('/:id', (req, res) => {
    // TODO: پیاده‌سازی دریافت جزئیات پیام
    res.json({ message: `جزئیات پیام با شناسه ${req.params.id}` });
});
/**
 * @route   PUT /api/v1/messages/:id
 * @desc    به‌روزرسانی یک پیام
 * @access  Private
 */
router.put('/:id', (req, res) => {
    // TODO: پیاده‌سازی به‌روزرسانی پیام
    res.json({ message: `پیام با شناسه ${req.params.id} به‌روزرسانی شد` });
});
/**
 * @route   DELETE /api/v1/messages/:id
 * @desc    حذف یک پیام
 * @access  Private
 */
router.delete('/:id', (req, res) => {
    // TODO: پیاده‌سازی حذف پیام
    res.json({ message: `پیام با شناسه ${req.params.id} حذف شد` });
});
exports.default = router;
