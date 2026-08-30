"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
exports.isValidEmail = isValidEmail;
exports.isValidPassword = isValidPassword;
exports.sanitizeInput = sanitizeInput;
function isValidEmail(email) {
    if (typeof email !== 'string')
        return false;
    const trimmed = email.trim();
    if (!trimmed)
        return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(trimmed);
}
function isValidPassword(password) {
    if (typeof password !== 'string')
        return false;
    if (password.length < 8)
        return false;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    return hasUppercase && hasNumber && hasSpecialChar;
}
function sanitizeInput(input) {
    if (typeof input !== 'string')
        return '';
    return input.replace(/<[^>]*>/g, '').trim();
}
class Validator {
    static validateNonEmptyString(value, fieldName) {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
            return {
                isValid: false,
                errors: [`${fieldName} is required and cannot be empty.`]
            };
        }
        return { isValid: true, errors: [] };
    }
    static validatePositiveNumber(value, fieldName) {
        if (typeof value !== 'number' || isNaN(value) || value <= 0) {
            return {
                isValid: false,
                errors: [`${fieldName} must be a positive number.`]
            };
        }
        return { isValid: true, errors: [] };
    }
    static validatePercentage(value, fieldName) {
        if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 100) {
            return {
                isValid: false,
                errors: [`${fieldName} must be a number between 0 and 100.`]
            };
        }
        return { isValid: true, errors: [] };
    }
}
exports.Validator = Validator;
