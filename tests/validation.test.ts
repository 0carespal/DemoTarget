import { isValidEmail, isValidPassword, Validator, sanitizeInput } from '../src/validation/validator';

describe('Validation Unit Tests', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('john.doe@subdomain.company.org')).toBe(true);
      expect(isValidEmail('customer+tag@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('   ')).toBe(false);
      expect(isValidEmail('plainaddress')).toBe(false);
      expect(isValidEmail('@missingusername.com')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('user@domain.c')).toBe(false);
      expect(isValidEmail('a()@b.com')).toBe(false);
    });

    it('should return true for email addresses with surrounding whitespace', () => {
      expect(isValidEmail('  user@example.com  ')).toBe(true);
    });

    it('should return false for non-string inputs', () => {
      expect(isValidEmail(123 as any)).toBe(false);
      expect(isValidEmail({ toString: () => 'user@example.com' } as any)).toBe(false);
      expect(isValidEmail(null as any)).toBe(false);
      expect(isValidEmail(undefined as any)).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for passwords meeting all criteria including special characters', () => {
      expect(isValidPassword('Pass123!')).toBe(true);
      expect(isValidPassword('Secure#2026')).toBe(true);
      expect(isValidPassword('Strong$Pass1')).toBe(true);
      expect(isValidPassword('Password123!')).toBe(true);
      expect(isValidPassword('P@ssword1')).toBe(true);
      expect(isValidPassword('Secure#2024')).toBe(true);
    });

    it('should return false for passwords shorter than 8 characters', () => {
      expect(isValidPassword('P1!a')).toBe(false);
      expect(isValidPassword('Pass12!')).toBe(false);
    });

    it('should return false for passwords missing an uppercase letter', () => {
      expect(isValidPassword('password123!')).toBe(false);
    });

    it('should return false for passwords missing a number', () => {
      expect(isValidPassword('Password!')).toBe(false);
    });

    it('should return false for passwords missing a special character', () => {
      expect(isValidPassword('Password123')).toBe(false);
    });

    it('should return false for non-string inputs', () => {
      expect(isValidPassword(12345678 as any)).toBe(false);
      expect(isValidPassword(null as any)).toBe(false);
    });
  });

  describe('Validator Utility Class', () => {
    it('should validate non-empty strings', () => {
      const valid = Validator.validateNonEmptyString('Hello', 'Field');
      expect(valid.isValid).toBe(true);
      expect(valid.errors).toEqual([]);

      const invalid = Validator.validateNonEmptyString('  ', 'Field');
      expect(invalid.isValid).toBe(false);
      expect(invalid.errors).toEqual(['Field is required and cannot be empty.']);
    });

    it('should validate positive numbers', () => {
      const valid = Validator.validatePositiveNumber(10, 'Field');
      expect(valid.isValid).toBe(true);
      expect(valid.errors).toEqual([]);

      const invalid = Validator.validatePositiveNumber(0, 'Field');
      expect(invalid.isValid).toBe(false);
      expect(invalid.errors).toEqual(['Field must be a positive number.']);

      const negative = Validator.validatePositiveNumber(-5, 'Field');
      expect(negative.isValid).toBe(false);
      expect(negative.errors).toEqual(['Field must be a positive number.']);
    });

    it('should validate percentages', () => {
      const valid = Validator.validatePercentage(50, 'Field');
      expect(valid.isValid).toBe(true);
      expect(valid.errors).toEqual([]);

      const low = Validator.validatePercentage(-1, 'Field');
      expect(low.isValid).toBe(false);
      expect(low.errors).toEqual(['Field must be a number between 0 and 100.']);

      const high = Validator.validatePercentage(101, 'Field');
      expect(high.isValid).toBe(false);
      expect(high.errors).toEqual(['Field must be a number between 0 and 100.']);
    });
  });

  describe('sanitizeInput', () => {
    it('should strip HTML tags and trim whitespace', () => {
      expect(sanitizeInput('  <script>alert("xss")</script> Hello  ')).toBe('alert("xss") Hello');
    });

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });
});
