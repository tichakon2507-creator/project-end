const express = require("express");
const {
    getLatestHealth,
    getHealthHistory,
    createHealthRecord,
} = require("../controllers/healthController");
const validate = require("../middleware/validate");

const router = express.Router();

// Legacy endpoint used by the existing frontend
router.get("/latest", getLatestHealth);

// Additional Health API endpoints
router.get("/history", getHealthHistory);
router.post("/", (req, res, next) => {
    const errors = validate(req.body, {
        device_id: { required: true, type: "string", minLength: 1, maxLength: 64 },
        heart_rate: { required: true, type: "number" },
        temperature: { required: true, type: "number" },
        spo2: { required: true, type: "number" },
        user_id: { required: false, type: "number" },
        battery_level: { required: false, type: "number" },
        record_id: { required: false, type: "integer" },
    });
    if (errors) {
        return res.status(400).json({ success: false, error: { message: "Validation failed", status: 400, type: "validation", data: { errors } } });
    }
    next();
}, createHealthRecord);

module.exports = router;
