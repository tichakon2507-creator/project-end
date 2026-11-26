const express = require("express");
const {
    registerUser,
    login,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    getMe,
} = require("../controllers/authController");
const validate = require("../middleware/validate");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

function validationError(res, errors) {
    return res.status(400).json({
        success: false,
        error: {
            message: "Validation failed",
            status: 400,
            type: "validation",
            data: { errors },
        },
    });
}

router.post("/register", (req, res, next) => {
    req.body.name = req.body.name || req.body.full_name || "";

    const errors = validate(req.body, {
        name: { required: true, type: "string", minLength: 1, maxLength: 255 },
        username: { required: true, type: "string", minLength: 3, maxLength: 64 },
        email: { required: true, type: "email" },
        password: { required: true, type: "string", minLength: 6, maxLength: 255 },
    });
    if (errors) {
        return validationError(res, errors);
    }
    next();
}, registerUser);

router.post("/login", (req, res, next) => {
    req.body.identifier =
        req.body.identifier || req.body.username || req.body.email || "";

    const errors = validate(req.body, {
        identifier: { required: true, type: "string", minLength: 1, maxLength: 255 },
        password: { required: true, type: "string", minLength: 1, maxLength: 255 },
    });
    if (errors) {
        return validationError(res, errors);
    }
    next();
}, login);

router.post("/forgot-password", (req, res, next) => {
    const errors = validate(req.body, {
        identifier: { required: true, type: "string", minLength: 1, maxLength: 255 },
    });
    if (errors) {
        return validationError(res, errors);
    }
    next();
}, forgotPassword);

router.post("/reset-password", (req, res, next) => {
    const errors = validate(req.body, {
        identifier: { required: true, type: "string", minLength: 1, maxLength: 255 },
        otp: { required: true, type: "string", minLength: 6, maxLength: 6 },
        new_password: { required: true, type: "string", minLength: 6, maxLength: 255 },
    });
    if (errors) {
        return validationError(res, errors);
    }
    next();
}, resetPassword);

router.patch("/me", authenticateToken, (req, res, next) => {
    const errors = validate(req.body, {
        name: { required: false, type: "string", minLength: 1, maxLength: 255 },
        full_name: { required: false, type: "string", minLength: 1, maxLength: 255 },
        email: { required: false, type: "email" },
    });
    if (errors) {
        return validationError(res, errors);
    }
    next();
}, updateProfile);

router.post("/change-password", authenticateToken, (req, res, next) => {
    const errors = validate(req.body, {
        current_password: { required: true, type: "string", minLength: 1, maxLength: 255 },
        new_password: { required: true, type: "string", minLength: 6, maxLength: 255 },
    });
    if (errors) {
        return validationError(res, errors);
    }
    next();
}, changePassword);

router.get("/me", authenticateToken, getMe);

module.exports = router;
