"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
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
}
exports.Validator = Validator;
