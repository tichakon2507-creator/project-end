const express = require("express");
const validate = require("../middleware/validate");
const { getActiveEmergencies, getEmergencyHistory, createEmergencyEvent, updateEmergencyStatus } = require("../controllers/emergencyController");

const router = express.Router();

router.get("/status", getActiveEmergencies);
router.get("/history", getEmergencyHistory);
router.post("/", (req, res, next) => {
    const errors = validate(req.body, {
        device_id: { required: true, type: "string", minLength: 1, maxLength: 64 },
        event_type: { required: false, type: "string", maxLength: 50 },
        description: { required: false, type: "string" },
        latitude: { required: true, type: "number" },
        longitude: { required: true, type: "number" },
        status: { required: false, type: "string" },
    });
    if (errors) {
        return res.status(400).json({ success: false, error: { message: "Validation failed", status: 400, type: "validation", data: { errors } } });
    }
    next();
}, createEmergencyEvent);

router.patch("/:id/status", (req, res, next) => {
    const errors = validate(req.body, {
        status: { required: true, type: "string" },
        resolved_at: { required: false, type: "string" },
    });
    if (errors) {
        return res.status(400).json({ success: false, error: { message: "Validation failed", status: 400, type: "validation", data: { errors } } });
    }
    next();
}, updateEmergencyStatus);

module.exports = router;
