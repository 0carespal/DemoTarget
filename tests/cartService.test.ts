import {
  calculateSubtotal,
  applyDiscounts,
  calculateTotal,
  calculateLineTotal,
  canApplyDiscount,
  ShoppingCart,
} from '../src/cart/cartService';
import { Discount, CartItem } from '../src/cart/types';

describe('cartService', () => {
  describe('applyDiscounts', () => {
    it('should calculate single percentage discount correctly', () => {
      const discounts: Discount[] = [
        { id: '1', code: 'SAVE20', type: 'percentage', value: 20 },
      ];
      const result = applyDiscounts(100, discounts);
      expect(result.totalDiscount).toBe(20);
      expect(result.appliedDiscounts).toHaveLength(1);
    });

    it('should compound multiple percentage discounts sequentially', () => {
      const discounts: Discount[] = [
        { id: '1', code: 'HALF1', type: 'percentage', value: 50 },
        { id: '2', code: 'HALF2', type: 'percentage', value: 50 },
      ];
      const result = applyDiscounts(100, discounts);
      // 100 -> 50 (50 off), then 50 -> 25 (25 off). Total discount = 75
      expect(result.totalDiscount).toBe(75);
      expect(result.appliedDiscounts).toHaveLength(2);
      expect(result.appliedDiscounts[0].amount).toBe(50);
      expect(result.appliedDiscounts[1].amount).toBe(25);
    });

    it('should calculate fixed discount correctly', () => {
      const discounts: Discount[] = [
        { id: '1', code: '10OFF', type: 'fixed', value: 10 },
      ];
      const result = applyDiscounts(100, discounts);
      expect(result.totalDiscount).toBe(10);
      expect(result.appliedDiscounts[0].amount).toBe(10);
    });

    it('should not allow total discount to exceed subtotal', () => {
      const discounts: Discount[] = [
        { id: '1', code: 'BIGFIXED', type: 'fixed', value: 150 },
      ];
      const result = applyDiscounts(100, discounts);
      expect(result.totalDiscount).toBe(100);
    });

    it('should skip invalid / negative discount values', () => {
      const discounts: Discount[] = [
        { id: '1', code: 'INVALID', type: 'percentage', value: -50 },
      ];
      const result = applyDiscounts(100, discounts);
      expect(result.totalDiscount).toBe(0);
      expect(result.appliedDiscounts).toHaveLength(0);
    });

    it('should handle empty discounts array', () => {
      const result = applyDiscounts(100, []);
      expect(result.totalDiscount).toBe(0);
      expect(result.appliedDiscounts).toHaveLength(0);
    });

    it('should handle zero or negative subtotal', () => {
      const discounts: Discount[] = [
        { id: '1', code: '10OFF', type: 'fixed', value: 10 },
      ];
      expect(applyDiscounts(0, discounts).totalDiscount).toBe(0);
      expect(applyDiscounts(-50, discounts).totalDiscount).toBe(0);
    });
  });

  describe('calculateTotal', () => {
    it('should return correct final total with compounded percentage discounts', () => {
      const items: CartItem[] = [{ id: '1', name: 'Item', price: 100, quantity: 1 }];
      const discounts: Discount[] = [
        { id: '1', code: 'HALF1', type: 'percentage', value: 50 },
        { id: '2', code: 'HALF2', type: 'percentage', value: 50 },
      ];
      const summary = calculateTotal(items, discounts);
      expect(summary.subtotal).toBe(100);
      expect(summary.totalDiscount).toBe(75);
      expect(summary.finalTotal).toBe(25);
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
      type: 'fixed',
      value: 10,
      minSubtotal: 50,
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

    it('should reject invalid discount values', () => {
      const invalid = { ...discount, value: -10 };
      expect(canApplyDiscount(100, invalid).canApply).toBe(false);
    });
  });

  describe('ShoppingCart', () => {
    it('should calculate total with sequential discounts', () => {
      const cart = new ShoppingCart();
      cart.addItem({ id: '1', name: 'Product', price: 100, quantity: 1 });
      cart.applyDiscount({ id: 'd1', code: 'P50A', type: 'percentage', value: 50 });
      cart.applyDiscount({ id: 'd2', code: 'P50B', type: 'percentage', value: 50 });

      const summary = cart.getSummary();
      expect(summary.subtotal).toBe(100);
      expect(summary.totalDiscount).toBe(75);
      expect(summary.finalTotal).toBe(25);
    });
  });
});
