const express = require("express");
const validate = require("../middleware/validate");
const { getLatestLocations, getLocationHistory, createLocationRecord } = require("../controllers/locationController");

const router = express.Router();
router.get("/latest", getLatestLocations);
router.get("/history", getLocationHistory);
router.post("/", (req, res, next) => {
    const errors = validate(req.body, {
        device_id: { required: true, type: "string", minLength: 1, maxLength: 64 },
        latitude: { required: true, type: "number" },
        longitude: { required: true, type: "number" },
    });
    if (errors) {
        return res.status(400).json({ success: false, error: { message: "Validation failed", status: 400, type: "validation", data: { errors } } });
    }
    next();
}, createLocationRecord);

module.exports = router;
