import { Validator } from '../src/validation/validator';

describe('Validator Unit Tests', () => {
  describe('validateNonEmptyString', () => {
    it('should pass for valid string', () => {
      const res = Validator.validateNonEmptyString('Hello', 'Title');
      expect(res.isValid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('should fail for empty or whitespace string', () => {
      const res = Validator.validateNonEmptyString('   ', 'Title');
      expect(res.isValid).toBe(false);
      expect(res.errors).toContain('Title must be a non-empty string.');
    });
  });

  describe('validatePositiveNumber', () => {
    it('should pass for positive numbers', () => {
      const res = Validator.validatePositiveNumber(10.5, 'Price');
      expect(res.isValid).toBe(true);
    });

    it('should fail for 0 or negative numbers', () => {
      const res1 = Validator.validatePositiveNumber(0, 'Price');
      expect(res1.isValid).toBe(false);

      const res2 = Validator.validatePositiveNumber(-5, 'Price');
      expect(res2.isValid).toBe(false);
    });
  });

  describe('validatePercentage', () => {
    it('should pass for valid percentages (0-100)', () => {
      expect(Validator.validatePercentage(0, 'Discount').isValid).toBe(true);
      expect(Validator.validatePercentage(50, 'Discount').isValid).toBe(true);
      expect(Validator.validatePercentage(100, 'Discount').isValid).toBe(true);
    });

    it('should fail for out of range percentages', () => {
      expect(Validator.validatePercentage(-1, 'Discount').isValid).toBe(false);
      expect(Validator.validatePercentage(105, 'Discount').isValid).toBe(false);
    });
  });
});
