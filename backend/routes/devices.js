const express = require("express");
const {
    getDevices,
    getDeviceById,
    getDeviceStatus,
    getDeviceProfile,
    updateDeviceProfile,
} = require("../controllers/devicesController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();
router.get("/", getDevices);
router.get("/:deviceId/profile", getDeviceProfile);
router.put("/:deviceId/profile", authenticateToken, updateDeviceProfile);
router.get("/:deviceId/status", getDeviceStatus);
router.get("/:deviceId", getDeviceById);

module.exports = router;
