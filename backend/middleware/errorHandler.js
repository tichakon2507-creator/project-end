class AppError extends Error {
    constructor(statusCode, type, message, data = null) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.type = type;
        this.data = data;
    }
}

function isDev() {
    return process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
}

function formatError(error) {
    const isProd = !isDev();
    const statusCode = error.statusCode || 500;

    return {
        success: false,
        error: {
            message: error.message || "Internal Server Error",
            status: statusCode,
            type: error.type || "server",
            ...(isProd ? {} : { stack: error.stack || "", data: error.data || null }),
        },
    };
}

function sendError(res, error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
        success: false,
        error: {
            message: error.message || "Request failed",
            status: statusCode,
            type: error.type || "client",
            ...(isDev() ? { data: error.data || null } : {}),
        },
    });
}

function errorHandler(err, req, res, _next) {
    // Log all errors server-side
    console.error(`[API ERROR] ${err.stack || err.message}`);

    const { statusCode, message, type, data } = err;

    // 4xx — Client Errors
    if (statusCode >= 400 && statusCode < 500) {
        return res.status(statusCode).json({
            success: false,
            error: {
                message: message || "Bad Request",
                status: statusCode,
                type: type || "client",
                ...(process.env.NODE_ENV !== "production" ? { data } : {}),
            },
        });
    }

    // 5xx — Server Errors
    if (statusCode === 500) {
        return res.status(500).json({
            success: false,
            error: {
                message: "Internal Server Error",
                status: 500,
                type: "server",
                ...(process.env.NODE_ENV !== "production" ? { data } : {}),
            },
        });
    }

    // Fallback
    return res.status(500).json({
        success: false,
        error: {
            message: "Something went wrong",
            status: 500,
            type: "server",
        },
    });
}

module.exports = {
    AppError,
    errorHandler,
    formatError,
    isDev,
    sendError,
};
