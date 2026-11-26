const AppError = require("./errorHandler").AppError;

function validate(input, schemaName) {
    if (!schemaName) {
        throw new AppError(400, "validation", "Validation schema is required.");
    }
    if (!input || typeof input !== "object") {
        throw new AppError(400, "validation", "Invalid request body. Object expected.");
    }

    const errors = [];

    Object.keys(schemaName).forEach((key) => {
        const field = schemaName[key];
        const value = input[key];

        if (field.required === true) {
            if (value === undefined || value === null || value === "") {
                errors.push(`${key} is required`);
                return;
            }
        }

        if (value === undefined || value === null) {
            return;
        }

        switch (field.type) {
            case "string":
                if (typeof value !== "string") {
                    errors.push(`${key} must be a string`);
                }
                if (field.minLength && value.length < field.minLength) {
                    errors.push(`${key} must be at least ${field.minLength} characters`);
                }
                if (field.maxLength && value.length > field.maxLength) {
                    errors.push(`${key} must be at most ${field.maxLength} characters`);
                }
                break;
            case "number":
            case "integer":
                if (typeof value !== "number" || Number.isNaN(value)) {
                    errors.push(`${key} must be a number`);
                }
                break;
            case "boolean":
                if (typeof value !== "boolean") {
                    errors.push(`${key} must be a boolean`);
                }
                break;
            case "email":
                if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errors.push(`${key} must be a valid email`);
                }
                break;
            case "date":
                if (typeof value !== "string" || isNaN(new Date(value).getTime())) {
                    errors.push(`${key} must be a valid date string`);
                }
                break;
            default:
                break;
        }
    });

    return errors.length > 0 ? errors : null;
}

module.exports = validate;
