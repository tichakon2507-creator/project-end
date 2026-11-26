const express = require("express");
const {
    getThresholds,
    updateThresholds,
    getNotificationSettings,
    updateNotificationSettings,
    getTelegramLink,
    disconnectTelegramLink,
    testTelegramMessage,
} = require("../controllers/settingsController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/thresholds", getThresholds);
router.put("/thresholds", authenticateToken, updateThresholds);
router.get("/notification", authenticateToken, getNotificationSettings);
router.put("/notification", authenticateToken, updateNotificationSettings);
router.get("/telegram-link", authenticateToken, getTelegramLink);
router.delete("/telegram-link", authenticateToken, disconnectTelegramLink);
router.post("/test-telegram", authenticateToken, testTelegramMessage);

module.exports = router;
