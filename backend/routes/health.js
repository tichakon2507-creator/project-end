const express = require("express");

const {
    getLatestHealth,
} = require("../controllers/healthController");

const router = express.Router();

router.get("/latest", getLatestHealth);

module.exports = router;