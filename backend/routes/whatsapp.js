const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const whatsappService = require('../services/whatsappService');

// @desc    Connect to WhatsApp (Start Client / Get QR)
// @route   GET /api/whatsapp/connect
// @access  Private
router.get('/connect', protect, async (req, res) => {
    try {
        const io = req.app.get('io'); // Get socket.io instance
        await whatsappService.initializeClient(req.user._id, io);
        res.json({ message: 'WhatsApp client initialization started. Check socket for QR code.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get Connection Status
// @route   GET /api/whatsapp/status
// @access  Private
router.get('/status', protect, async (req, res) => {
    try {
        const client = whatsappService.getClient(req.user._id);

        if (client && client.info) {
            res.json({
                status: 'connected',
                user: client.info.wid.user,
                pushname: client.info.pushname
            });
        } else if (client) {
            res.json({ status: 'initializing' });
        } else {
            res.json({ status: 'disconnected' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Logout from WhatsApp
// @route   POST /api/whatsapp/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
    try {
        const success = await whatsappService.logoutClient(req.user._id);
        if (success) {
            res.json({ message: 'Logged out successfully' });
        } else {
            res.status(400).json({ message: 'No active session found to logout' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
