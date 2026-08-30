import { CartService, DiscountStrategyRegistry, CouponExpirationDiscountStrategy } from '../src/cart/cartService';
import { CartItem, DiscountRule, PercentageDiscount, FixedDiscount, BulkDiscount, CouponExpirationDiscount } from '../src/cart/types';

describe('CartService', () => {
  let cartService: CartService;

  const sampleItems: CartItem[] = [
    { id: '1', name: 'Widget', price: 10.0, quantity: 2 },
    { id: '2', name: 'Gadget', price: 20.0, quantity: 1 },
  ]; // Subtotal = 40.00

  beforeEach(() => {
    cartService = new CartService();
  });

  describe('stateful cart API', () => {
    it('should manage items and calculate summary', () => {
      cartService.addItem({ id: '1', name: 'Widget', price: 10.0, quantity: 2 });
      cartService.addItem({ id: '2', name: 'Gadget', price: 20.0, quantity: 1 });
      const summary = cartService.getSummary();
      expect(summary.subtotal).toBe(40.0);
      expect(summary.total).toBe(40.0);
    });

    it('should update item quantity and remove items when quantity <= 0', () => {
      cartService.addItem({ id: '1', name: 'Widget', price: 10.0, quantity: 2 });
      cartService.updateQuantity('1', 5);
      expect(cartService.calculateSubtotal()).toBe(50.0);
      cartService.updateQuantity('1', 0);
      expect(cartService.calculateSubtotal()).toBe(0);
    });

    it('should reject invalid or negative quantities in addItem and updateQuantity', () => {
      cartService.addItem({ id: '1', name: 'Widget', price: 10.0, quantity: 2 });
      cartService.addItem({ id: '1', name: 'Widget', price: 10.0, quantity: -1 }); // ignored
      expect(cartService.calculateSubtotal()).toBe(20.0);

      cartService.updateQuantity('1', 2.5); // non-integer removes/rejects
      expect(cartService.calculateSubtotal()).toBe(0);
    });

    it('should apply and remove discounts (including auto-assigning IDs to id-less rules)', () => {
      const discount: FixedDiscount = { id: 'd1', type: 'fixed', amount: 5 };
      cartService.addItem({ id: '1', name: 'Widget', price: 10.0, quantity: 2 });
      cartService.applyDiscount(discount);
      expect(cartService.getSummary().discount).toBe(5.0);
      cartService.removeDiscount('d1');
      expect(cartService.getSummary().discount).toBe(0.0);

      const idlessRule: DiscountRule = { type: 'fixed', amount: 5 };
      cartService.applyDiscount(idlessRule);
      const summary = cartService.getSummary();
      expect(summary.appliedDiscounts.length).toBe(1);
      const generatedId = summary.appliedDiscounts[0].id;
      expect(generatedId).toBeDefined();
      cartService.removeDiscount(generatedId);
      expect(cartService.getSummary().discount).toBe(0.0);
    });

    it('should prevent external mutation of applied discounts', () => {
      const discount: FixedDiscount = { id: 'd1', type: 'fixed', amount: 5 };
      cartService.addItem({ id: '1', name: 'Widget', price: 10.0, quantity: 2 });
      cartService.applyDiscount(discount);
      discount.amount = 100; // mutate original caller object
      expect(cartService.getSummary().discount).toBe(5.0);
    });

    it('should clear cart items and discounts', () => {
      cartService.addItem({ id: '1', name: 'Widget', price: 10.0, quantity: 2 });
      cartService.applyDiscount({ id: 'd1', type: 'fixed', amount: 5 });
      cartService.clear();
      expect(cartService.getSummary().subtotal).toBe(0);
      expect(cartService.getSummary().appliedDiscounts.length).toBe(0);
    });
  });

  describe('calculateSubtotal', () => {
    it('should calculate the correct subtotal for cart items', () => {
      const subtotal = cartService.calculateSubtotal(sampleItems);
      expect(subtotal).toBe(40.0);
    });

    it('should return 0 for an empty cart', () => {
      expect(cartService.calculateSubtotal([])).toBe(0);
    });

    it('should ignore invalid or negative prices and quantities', () => {
      const invalidItems: CartItem[] = [
        { id: '1', name: 'Bad Price', price: -10, quantity: 2 },
        { id: '2', name: 'Bad Qty', price: 10, quantity: -1 },
        { id: '3', name: 'NaN Price', price: NaN, quantity: 1 },
        { id: '4', name: 'Good Item', price: 15, quantity: 2 },
      ];
      expect(cartService.calculateSubtotal(invalidItems)).toBe(30.0);
    });
  });

  describe('calculateDiscount', () => {
    it('should apply percentage discount correctly', () => {
      const rules: PercentageDiscount[] = [{ id: 'p1', type: 'percentage', percentage: 10 }];
      const discount = cartService.calculateDiscount(sampleItems, rules);
      expect(discount).toBe(4.0);
    });

    it('should apply fixed amount discount correctly using type "fixed"', () => {
      const rules: FixedDiscount[] = [{ id: 'f1', type: 'fixed', amount: 5 }];
      const discount = cartService.calculateDiscount(sampleItems, rules);
      expect(discount).toBe(5.0);
    });

    it('should support legacy "fixed_amount" alias', () => {
      const rules: DiscountRule[] = [{ type: 'fixed_amount', value: 5 }];
      const discount = cartService.calculateDiscount(sampleItems, rules);
      expect(discount).toBe(5.0);
    });

    it('should apply bulk discount when minQuantity is met and respect remainingSubtotal', () => {
      const rules: BulkDiscount[] = [{ id: 'b1', type: 'bulk', minQuantity: 3, discountPercentage: 15 }];
      const discount = cartService.calculateDiscount(sampleItems, rules);
      expect(discount).toBe(6.0);

      // Verify bulk discount calculated against remaining subtotal after fixed discount
      const items: CartItem[] = [{ id: '1', name: 'Item', price: 100, quantity: 1 }];
      const stackedRules: (DiscountRule | FixedDiscount | BulkDiscount)[] = [
        { id: 'f1', type: 'fixed', amount: 10 },
        { id: 'b1', type: 'bulk', minQuantity: 1, discountPercentage: 10 },
      ];
      expect(cartService.calculateDiscount(items, stackedRules)).toBe(19.0);
    });

    it('should compound sequential percentage discounts correctly', () => {
      const rules: PercentageDiscount[] = [
        { id: 'p1', type: 'percentage', percentage: 50 },
        { id: 'p2', type: 'percentage', percentage: 50 },
      ];
      const items: CartItem[] = [{ id: '1', name: 'Item', price: 100, quantity: 1 }];
      const discount = cartService.calculateDiscount(items, rules);
      expect(discount).toBe(75.0);
    });

    it('should handle undefined specialized properties correctly with fallback to value', () => {
      const rule: DiscountRule = { type: 'fixed', amount: undefined, value: 5 };
      expect(cartService.calculateDiscount(sampleItems, [rule])).toBe(5.0);
    });

    it('should cap total discount at subtotal', () => {
      const rules: FixedDiscount[] = [{ id: 'f1', type: 'fixed', amount: 100 }];
      const discount = cartService.calculateDiscount(sampleItems, rules);
      expect(discount).toBe(40.0);
    });
  });

  describe('CouponExpirationDiscountStrategy', () => {
    it('should apply active coupon discount when expiresAt is in the future', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // +1 day
      const rules: CouponExpirationDiscount[] = [
        { id: 'c1', type: 'coupon_expiration', amount: 10, expiresAt: futureDate },
      ];
      const result = cartService.calculateTotal(sampleItems, rules);
      expect(result.discount).toBe(10.0);
      expect(result.total).toBe(30.0);
    });

    it('should apply $0.00 discount when expiresAt is in the past', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString(); // -1 day
      const rules: CouponExpirationDiscount[] = [
        { id: 'c1', type: 'coupon_expiration', amount: 10, expiresAt: pastDate },
      ];
      const result = cartService.calculateTotal(sampleItems, rules);
      expect(result.discount).toBe(0.0);
      expect(result.total).toBe(40.0);
    });

    it('should apply $0.00 discount at the exact expiration timestamp', () => {
      const now = 1700000000000;
      jest.spyOn(Date, 'now').mockReturnValue(now);
      const exactDate = new Date(now).toISOString();
      const rules: CouponExpirationDiscount[] = [
        { id: 'c1', type: 'coupon_expiration', amount: 10, expiresAt: exactDate },
      ];
      const result = cartService.calculateTotal(sampleItems, rules);
      expect(result.discount).toBe(0.0);
      jest.restoreAllMocks();
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
      const rules: FixedDiscount[] = [{ id: 'f1', type: 'fixed', amount: 10 }];
      const result = cartService.calculateTotal(sampleItems, rules);
      expect(result).toEqual({ subtotal: 40.0, discount: 10.0, total: 30.0 });
    });
  });
});
