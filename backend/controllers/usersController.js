const usersModel = require("../models/users");

async function getUsers(req, res, next) {
    try {
        const data = await usersModel.getAll();
        return res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("Get Users Error:", err);
        return next(err);
    }
}

async function getUserProfile(req, res, next) {
    try {
        const { userId } = req.params;
        const user = await usersModel.getById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: { message: "User not found.", status: 404, type: "not_found" },
            });
        }
        return res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error("Get User Profile Error:", err);
        return next(err);
    }
}

async function updateUser(req, res, next) {
    try {
        const { userId } = req.params;
        const status = req.body?.status;
        if (typeof status !== "string" || status.trim() === "") {
            return res.status(400).json({
                success: false,
                error: {
                    message: "Validation failed",
                    status: 400,
                    type: "validation",
                    data: { status: "Status must be a non-empty string." },
                },
            });
        }
        const user = await usersModel.updateStatus(userId, status.trim());
        if (!user) {
            return res.status(404).json({
                success: false,
                error: { message: "User not found.", status: 404, type: "not_found" },
            });
        }
        return res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error("Update User Error:", err);
        return next(err);
    }
}

module.exports = { getUsers, getUserProfile, updateUser };
