export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(trimmed);
}

export function isValidPassword(password: string): boolean {
  if (typeof password !== 'string') return false;
  if (password.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return hasUppercase && hasNumber && hasSpecialChar;
}

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '').trim();
}

export class Validator {
  static validateNonEmptyString(value: string, fieldName: string): ValidationResult {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      return {
        isValid: false,
        message: `${fieldName} is required and cannot be empty.`
      };
    }
    return { isValid: true };
  }

  static validatePositiveNumber(value: number, fieldName: string): ValidationResult {
    if (typeof value !== 'number' || isNaN(value) || value <= 0) {
      return {
        isValid: false,
        message: `${fieldName} must be a positive number.`
      };
    }
    return { isValid: true };
  }

  static validatePercentage(value: number, fieldName: string): ValidationResult {
    if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 100) {
      return {
        isValid: false,
        message: `${fieldName} must be a number between 0 and 100.`
      };
    }
    return { isValid: true };
  }
}
