export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
/**
 * Validates whether the given string is a valid email address.
 *
 * @param email - The email address string to validate
 * @returns True if valid email format, false otherwise
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Validates password criteria such as minimum length, uppercase characters, and numeric digits.
 *
 * @param password - The password string to validate
 * @returns True if password satisfies requirements, false otherwise
 */
export declare function isValidPassword(password: string): boolean;
export declare class Validator {
    static validateNonEmptyString(value: string, fieldName: string): ValidationResult;
    static validatePositiveNumber(value: number, fieldName: string): ValidationResult;
    static validateNonNegativeNumber(value: number, fieldName: string): ValidationResult;
    static validatePercentage(value: number, fieldName: string): ValidationResult;
    static isValidEmail(email: string): boolean;
    static isValidPassword(password: string): boolean;
}
