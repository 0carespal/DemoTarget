"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
exports.isValidEmail = isValidEmail;
exports.isValidPassword = isValidPassword;
/**
 * Validates whether the given string is a valid email address.
 *
 * @param email - The email address string to validate
 * @returns True if valid email format, false otherwise
 */
function isValidEmail(email) {
    if (typeof email !== 'string' || !email.trim()) {
        return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
}
/**
 * Validates password criteria such as minimum length, uppercase characters, and numeric digits.
 *
 * @param password - The password string to validate
 * @returns True if password satisfies requirements, false otherwise
 */
function isValidPassword(password) {
    if (typeof password !== 'string') {
        return false;
    }
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasMinLength && hasUppercase && hasNumber;
}
class Validator {
    static validateNonEmptyString(value, fieldName) {
        const errors = [];
        if (!value || value.trim().length === 0) {
            errors.push(`${fieldName} must be a non-empty string.`);
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    static validatePositiveNumber(value, fieldName) {
        const errors = [];
        if (typeof value !== 'number' || isNaN(value) || value <= 0) {
            errors.push(`${fieldName} must be a positive number greater than zero.`);
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    static validateNonNegativeNumber(value, fieldName) {
        const errors = [];
        if (typeof value !== 'number' || isNaN(value) || value < 0) {
            errors.push(`${fieldName} must be a non-negative number.`);
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    static validatePercentage(value, fieldName) {
        const errors = [];
        if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 100) {
            errors.push(`${fieldName} must be a percentage between 0 and 100.`);
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    static isValidEmail(email) {
        return isValidEmail(email);
    }
    static isValidPassword(password) {
        return isValidPassword(password);
    }
}
exports.Validator = Validator;
