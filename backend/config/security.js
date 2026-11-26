const jwt = require("jsonwebtoken");

const JWT_SECRET =
    process.env.JWT_SECRET || "very_secure_jwt_secret_change_this";
const ACCESS_EXPIRES_IN = Number(
    process.env.ACCESS_TOKEN_EXPIRES_IN ||
        process.env.JWT_EXPIRES_IN ||
        86400
);

function signAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: Number.isFinite(ACCESS_EXPIRES_IN) ? ACCESS_EXPIRES_IN : 86400,
    });
}

function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
}

module.exports = {
    JWT_SECRET,
    ACCESS_EXPIRES_IN: Number.isFinite(ACCESS_EXPIRES_IN) ? ACCESS_EXPIRES_IN : 86400,
    signAccessToken,
    verifyAccessToken,
};
