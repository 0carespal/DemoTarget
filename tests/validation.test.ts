import { isValidEmail, isValidPassword, sanitizeInput } from '../src/validation/validator';

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for valid passwords meeting all criteria', () => {
      expect(isValidPassword('Password123!')).toBe(true);
      expect(isValidPassword('P@ssword1')).toBe(true);
      expect(isValidPassword('Secure#2024')).toBe(true);
    });

    it('should return false for passwords shorter than 8 characters', () => {
      expect(isValidPassword('Pass1!')).toBe(false);
    });

    it('should return false for passwords without uppercase letters', () => {
      expect(isValidPassword('password123!')).toBe(false);
    });

    it('should return false for passwords without numbers', () => {
      expect(isValidPassword('Password!')).toBe(false);
    });

    it('should return false for passwords without special characters', () => {
      expect(isValidPassword('Password123')).toBe(false);
    });

    it('should return false for empty passwords', () => {
      expect(isValidPassword('')).toBe(false);
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
