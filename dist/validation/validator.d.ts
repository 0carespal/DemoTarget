export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export declare function isValidEmail(email: string): boolean;
export declare function isValidPassword(password: string): boolean;
export declare function sanitizeInput(input: string): string;
export declare class Validator {
    static validateNonEmptyString(value: string, fieldName: string): ValidationResult;
    static validatePositiveNumber(value: number, fieldName: string): ValidationResult;
    static validatePercentage(value: number, fieldName: string): ValidationResult;
}
