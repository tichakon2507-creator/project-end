const { verifyAccessToken } = require("../config/security");
const { AppError, sendError } = require("../middleware/errorHandler");

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return sendError(
            res,
            new AppError(401, "auth", "Missing or invalid token. Access denied.")
        );
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyAccessToken(token);

        if (decoded.type !== "access") {
            return sendError(
                res,
                new AppError(401, "auth", "Invalid token type.")
            );
        }

        if (!decoded.user_id) {
            return sendError(
                res,
                new AppError(401, "auth", "Token missing user payload.")
            );
        }

        req.user = decoded;
        req.authProvider = "jwt";
        return next();
    } catch (err) {
        if (err && err.name === "TokenExpiredError") {
            return sendError(
                res,
                new AppError(401, "auth", "Token expired.")
            );
        }
        return sendError(
            res,
            new AppError(401, "auth", "Invalid token signature.")
        );
    }
}

function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            return sendError(
                res,
                new AppError(401, "auth", "Authentication required.")
            );
        }

        if (!allowedRoles.includes(user.role)) {
            return sendError(
                res,
                new AppError(
                    403,
                    "auth",
                    "Insufficient permissions. Allowed roles only."
                )
            );
        }

        return next();
    };
}

module.exports = {
    authenticateToken,
    authorizeRoles,
};
