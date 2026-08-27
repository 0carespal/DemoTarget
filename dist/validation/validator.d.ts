export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export declare class Validator {
    static validateNonEmptyString(value: string, fieldName: string): ValidationResult;
    static validatePositiveNumber(value: number, fieldName: string): ValidationResult;
    static validateNonNegativeNumber(value: number, fieldName: string): ValidationResult;
    static validatePercentage(value: number, fieldName: string): ValidationResult;
}
