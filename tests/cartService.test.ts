import { CartService, DiscountStrategyRegistry, CouponExpirationDiscountStrategy } from '../src/cart/cartService';
import { CartItem, DiscountRule } from '../src/cart/types';

describe('CartService', () => {
  let cartService: CartService;

  const sampleItems: CartItem[] = [
    { id: '1', name: 'Widget', price: 10.0, quantity: 2 },
    { id: '2', name: 'Gadget', price: 20.0, quantity: 1 },
  ]; // Subtotal = 40.00

  beforeEach(() => {
    cartService = new CartService();
  });

  describe('calculateSubtotal', () => {
    it('should calculate the correct subtotal for cart items', () => {
      const subtotal = cartService.calculateSubtotal(sampleItems);
      expect(subtotal).toBe(40.0);
    });

    it('should return 0 for an empty cart', () => {
      expect(cartService.calculateSubtotal([])).toBe(0);
    });
  });

  describe('calculateDiscount', () => {
    it('should apply percentage discount correctly', () => {
      const rules: DiscountRule[] = [{ type: 'percentage', value: 10 }];
      const discount = cartService.calculateDiscount(sampleItems, rules);
      expect(discount).toBe(4.0);
    });

    it('should apply fixed amount discount correctly', () => {
      const rules: DiscountRule[] = [{ type: 'fixed_amount', value: 5 }];
      const discount = cartService.calculateDiscount(sampleItems, rules);
      expect(discount).toBe(5.0);
    });

    it('should apply bulk discount when minQuantity is met', () => {
      const rules: DiscountRule[] = [{ type: 'bulk', minQuantity: 3, value: 15 }];
      const discount = cartService.calculateDiscount(sampleItems, rules);
      expect(discount).toBe(6.0);
    });

    it('should not apply bulk discount when minQuantity is not met', () => {
      const rules: DiscountRule[] = [{ type: 'bulk', minQuantity: 5, value: 15 }];
      const discount = cartService.calculateDiscount(sampleItems, rules);
      expect(discount).toBe(0);
    });

    it('should cap total discount at subtotal', () => {
      const rules: DiscountRule[] = [{ type: 'fixed_amount', value: 100 }];
      const discount = cartService.calculateDiscount(sampleItems, rules);
      expect(discount).toBe(40.0);
    });
  });

  describe('CouponExpirationDiscountStrategy', () => {
    it('should apply active coupon discount when expiresAt is in the future', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // +1 day
      const rules: DiscountRule[] = [
        { type: 'coupon_expiration', value: 10, expiresAt: futureDate },
      ];
      const result = cartService.calculateTotal(sampleItems, rules);
      expect(result.discount).toBe(10.0);
      expect(result.total).toBe(30.0);
    });

    it('should apply $0.00 discount when expiresAt is in the past', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString(); // -1 day
      const rules: DiscountRule[] = [
        { type: 'coupon_expiration', value: 10, expiresAt: pastDate },
      ];
      const result = cartService.calculateTotal(sampleItems, rules);
      expect(result.discount).toBe(0.0);
      expect(result.total).toBe(40.0);
    });

    it('should apply $0.00 discount when expiresAt is missing or invalid', () => {
      const missingDateRules: DiscountRule[] = [
        { type: 'coupon_expiration', value: 10 },
      ];
      const invalidDateRules: DiscountRule[] = [
        { type: 'coupon_expiration', value: 10, expiresAt: 'invalid-date' },
      ];

      expect(cartService.calculateDiscount(sampleItems, missingDateRules)).toBe(0);
      expect(cartService.calculateDiscount(sampleItems, invalidDateRules)).toBe(0);
    });

    it('should be registered by default in DiscountStrategyRegistry', () => {
      const registry = new DiscountStrategyRegistry();
      const strategy = registry.get('coupon_expiration');
      expect(strategy).toBeInstanceOf(CouponExpirationDiscountStrategy);
    });
  });

  describe('calculateTotal', () => {
    it('should return correct summary without discounts', () => {
      const result = cartService.calculateTotal(sampleItems);
      expect(result).toEqual({ subtotal: 40.0, discount: 0, total: 40.0 });
    });

    it('should return correct summary with discounts', () => {
      const rules: DiscountRule[] = [{ type: 'fixed_amount', value: 10 }];
      const result = cartService.calculateTotal(sampleItems, rules);
      expect(result).toEqual({ subtotal: 40.0, discount: 10.0, total: 30.0 });
    });
  });
});
