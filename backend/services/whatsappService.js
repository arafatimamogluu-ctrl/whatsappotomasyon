const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Session = require('../models/Session');
const fs = require('fs');
const path = require('path');

// Store active clients in memory: { userId: Client }
const clients = {};

const initializeClient = async (userId, socketIo) => {
    console.log(`Initializing client for user: ${userId}`);

    // If client already exists for this user, return it (or restart it)
    if (clients[userId]) {
        const client = clients[userId];
        // If client is already ready, just emit status
        if (client.info) {
            socketIo.emit(`whatsapp-status-${userId}`, { status: 'ready', info: client.info });
            return client;
        }
    }

    // Define session path for LocalAuth
    const sessionPath = path.join(__dirname, '../.wwebjs_auth', `session-${userId}`);

    // Create new client instance
    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: `session-${userId}`,
            dataPath: path.join(__dirname, '../.wwebjs_auth')
        }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // <- this one doesn't works in Windows
                '--disable-gpu'
            ]
        },
        qrMaxRetries: 5
    });

    // --- Event Listeners ---

    client.on('qr', (qr) => {
        console.log(`QR Code received for user ${userId}`);
        // Emit QR to frontend via Socket.io
        socketIo.emit(`whatsapp-qr-${userId}`, { qr });

        // Update/Create session in DB (optional, mainly for tracking)
        updateSessionStatus(userId, 'qr_received', false);
    });

    client.on('ready', () => {
        console.log(`Client is ready for user ${userId}!`);
        socketIo.emit(`whatsapp-status-${userId}`, { status: 'ready', info: client.info });
        updateSessionStatus(userId, 'ready', true, client.info.wid.user);
    });

    client.on('authenticated', () => {
        console.log(`Client authenticated for user ${userId}`);
        socketIo.emit(`whatsapp-status-${userId}`, { status: 'authenticated' });
    });

    client.on('auth_failure', (msg) => {
        console.error(`Auth failure for user ${userId}:`, msg);
        socketIo.emit(`whatsapp-status-${userId}`, { status: 'auth_failure', message: msg });
        updateSessionStatus(userId, 'auth_failure', false);
    });

    client.on('disconnected', (reason) => {
        console.log(`Client disconnected for user ${userId}:`, reason);
        socketIo.emit(`whatsapp-status-${userId}`, { status: 'disconnected', reason });
        updateSessionStatus(userId, 'disconnected', false);

        // Destroy client and remove from memory
        client.destroy();
        delete clients[userId];
    });

    // Initialize
    try {
        await client.initialize();
        clients[userId] = client; // Store client request
    } catch (err) {
        console.error(`Error initializing client for user ${userId}:`, err);
        socketIo.emit(`whatsapp-status-${userId}`, { status: 'error', message: err.message });
    }

    return client;
};

const getClient = (userId) => {
    return clients[userId];
};

const logoutClient = async (userId) => {
    const client = clients[userId];
    if (client) {
        await client.logout();
        await client.destroy();
        delete clients[userId];
        await updateSessionStatus(userId, 'disconnected', false);
        return true;
    }
    return false;
};

// Helper to update session in DB
const updateSessionStatus = async (userId, status, isConnected, phoneNumber = null) => {
    try {
        let session = await Session.findOne({ userId });

        if (!session) {
            session = new Session({
                userId,
                sessionId: `session-${userId}`,
            });
        }

        session.isConnected = isConnected;
        if (phoneNumber) session.phoneNumber = phoneNumber;
        session.lastActivity = Date.now();

        await session.save();
    } catch (error) {
        console.error('Error updating session status:', error);
    }
};

module.exports = {
    initializeClient,
    getClient,
    logoutClient
};
