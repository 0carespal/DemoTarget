"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = exports.sanitizeInput = exports.isValidPassword = exports.isValidEmail = void 0;
function isValidEmail(email) {
    if (typeof email !== 'string')
        return false;
    var trimmed = email.trim();
    if (!trimmed)
        return false;
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(trimmed);
}
exports.isValidEmail = isValidEmail;
function isValidPassword(password) {
    if (typeof password !== 'string')
        return false;
    if (password.length < 8)
        return false;
    var hasUppercase = /[A-Z]/.test(password);
    var hasNumber = /[0-9]/.test(password);
    var hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    return hasUppercase && hasNumber && hasSpecialChar;
}
exports.isValidPassword = isValidPassword;
function sanitizeInput(input) {
    if (typeof input !== 'string')
        return '';
    return input.replace(/<[^>]*>/g, '').trim();
}
exports.sanitizeInput = sanitizeInput;
var Validator = /** @class */ (function () {
    function Validator() {
    }
    Validator.validateNonEmptyString = function (value, fieldName) {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
            return {
                isValid: false,
                message: fieldName + " is required and cannot be empty."
            };
        }
        return { isValid: true };
    };
    Validator.validatePositiveNumber = function (value, fieldName) {
        if (typeof value !== 'number' || isNaN(value) || value <= 0) {
            return {
                isValid: false,
                message: fieldName + " must be a positive number."
            };
        }
        return { isValid: true };
    };
    Validator.validatePercentage = function (value, fieldName) {
        if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 100) {
            return {
                isValid: false,
                message: fieldName + " must be a number between 0 and 100."
            };
        }
        return { isValid: true };
    };
    return Validator;
}());
exports.Validator = Validator;
