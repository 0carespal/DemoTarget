import { applyDiscounts, calculateLineTotal, canApplyDiscount } from '../src/cart/cartService';
import { Discount } from '../src/cart/types';

describe('cartService', () => {
  describe('applyDiscounts', () => {
    it('should calculate single percentage discount correctly', () => {
      const discounts: Discount[] = [
        { id: '1', code: 'SAVE20', type: 'PERCENTAGE', value: 20, isActive: true },
      ];
      const result = applyDiscounts(100, discounts);
      expect(result.finalTotal).toBe(80);
      expect(result.totalDiscount).toBe(20);
    });

    it('should compound multiple percentage discounts sequentially', () => {
      const discounts: Discount[] = [
        { id: '1', code: 'HALF1', type: 'PERCENTAGE', value: 50, isActive: true },
        { id: '2', code: 'HALF2', type: 'PERCENTAGE', value: 50, isActive: true },
      ];
      const result = applyDiscounts(100, discounts);
      // 100 -> 50 (50 off), then 50 -> 25 (25 off). Total discount = 75, final = 25
      expect(result.totalDiscount).toBe(75);
      expect(result.finalTotal).toBe(25);
    });

    it('should calculate fixed discount correctly', () => {
      const discounts: Discount[] = [
        { id: '1', code: '10OFF', type: 'FIXED', value: 10, isActive: true },
      ];
      const result = applyDiscounts(100, discounts);
      expect(result.finalTotal).toBe(90);
      expect(result.totalDiscount).toBe(10);
    });

    it('should not allow total discount to exceed subtotal', () => {
      const discounts: Discount[] = [
        { id: '1', code: 'BIGFIXED', type: 'FIXED', value: 150, isActive: true },
      ];
      const result = applyDiscounts(100, discounts);
      expect(result.finalTotal).toBe(0);
      expect(result.totalDiscount).toBe(100);
    });

    it('should skip inactive discounts', () => {
      const discounts: Discount[] = [
        { id: '1', code: 'INACTIVE', type: 'PERCENTAGE', value: 50, isActive: false },
      ];
      const result = applyDiscounts(100, discounts);
      expect(result.finalTotal).toBe(100);
      expect(result.totalDiscount).toBe(0);
      expect(result.appliedDiscounts[0].status).toBe('SKIPPED');
    });

    it('should handle empty discounts array', () => {
      const result = applyDiscounts(100, []);
      expect(result.finalTotal).toBe(100);
      expect(result.totalDiscount).toBe(0);
    });

    it('should handle zero or negative subtotal', () => {
      const discounts: Discount[] = [
        { id: '1', code: '10OFF', type: 'FIXED', value: 10, isActive: true },
      ];
      expect(applyDiscounts(0, discounts).finalTotal).toBe(0);
      expect(applyDiscounts(-50, discounts).finalTotal).toBe(0);
    });
  });

  describe('calculateLineTotal', () => {
    it('should calculate line total with zero discount', () => {
      expect(calculateLineTotal(10, 3)).toBe(30);
    });

    it('should apply line discount correctly', () => {
      expect(calculateLineTotal(10, 2, 10)).toBe(18);
    });

    it('should clamp discount percentage between 0 and 100', () => {
      expect(calculateLineTotal(10, 2, -10)).toBe(20);
      expect(calculateLineTotal(10, 2, 150)).toBe(0);
    });

    it('should return 0 for non-positive unit price or quantity', () => {
      expect(calculateLineTotal(-5, 2)).toBe(0);
      expect(calculateLineTotal(10, 0)).toBe(0);
    });
  });

  describe('canApplyDiscount', () => {
    const discount: Discount = {
      id: '1',
      code: 'MIN50',
      type: 'FIXED',
      value: 10,
      isActive: true,
      minimumSpend: 50,
    };

    it('should allow application if subtotal meets minimum spend', () => {
      expect(canApplyDiscount(50, discount).canApply).toBe(true);
      expect(canApplyDiscount(60, discount).canApply).toBe(true);
    });

    it('should reject application if subtotal is below minimum spend', () => {
      const result = canApplyDiscount(40, discount);
      expect(result.canApply).toBe(false);
      expect(result.reason).toContain('Minimum spend');
    });

    it('should reject inactive discount regardless of spend', () => {
      const inactive = { ...discount, isActive: false };
      expect(canApplyDiscount(100, inactive).canApply).toBe(false);
    });
  });
});
