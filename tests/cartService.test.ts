import { CartService, BulkDiscountStrategy } from '../src/cart/cartService';
import { CartItem, DiscountRule } from '../src/cart/types';

describe('CartService & Discount Strategies', () => {
  let cartService: CartService;

  beforeEach(() => {
    cartService = new CartService();
  });

  test('calculates total correctly without discounts', () => {
    cartService.addItem({ id: '1', name: 'Item 1', price: 10, quantity: 2 });
    const summary = cartService.getSummary();
    expect(summary.subtotal).toBe(20);
    expect(summary.discount).toBe(0);
    expect(summary.total).toBe(20);
  });

  test('applies percentage discount strategy', () => {
    cartService.addItem({ id: '1', name: 'Item 1', price: 100, quantity: 1 });
    cartService.applyDiscount({ id: 'd1', type: 'percentage', percentage: 10 });
    const summary = cartService.getSummary();
    expect(summary.subtotal).toBe(100);
    expect(summary.discount).toBe(10);
    expect(summary.total).toBe(90);
  });

  test('applies fixed amount discount strategy', () => {
    cartService.addItem({ id: '1', name: 'Item 1', price: 100, quantity: 1 });
    cartService.applyDiscount({ id: 'd1', type: 'fixed', amount: 15 });
    const summary = cartService.getSummary();
    expect(summary.subtotal).toBe(100);
    expect(summary.discount).toBe(15);
    expect(summary.total).toBe(85);
  });

  test('applies coupon expiration discount strategy when valid', () => {
    cartService.addItem({ id: '1', name: 'Item 1', price: 100, quantity: 1 });
    const futureDate = new Date(Date.now() + 100000).toISOString();
    cartService.applyDiscount({
      id: 'd1',
      type: 'coupon_expiration',
      amount: 20,
      expiresAt: futureDate,
    });
    const summary = cartService.getSummary();
    expect(summary.discount).toBe(20);
    expect(summary.total).toBe(80);
  });

  test('rejects expired coupon in coupon expiration strategy', () => {
    cartService.addItem({ id: '1', name: 'Item 1', price: 100, quantity: 1 });
    const pastDate = new Date(Date.now() - 100000).toISOString();
    cartService.applyDiscount({
      id: 'd1',
      type: 'coupon_expiration',
      amount: 20,
      expiresAt: pastDate,
    });
    const summary = cartService.getSummary();
    expect(summary.discount).toBe(0);
    expect(summary.total).toBe(100);
  });

  test('rejects coupon expiring exactly at boundary (expirationTime <= now)', () => {
    const fixedNow = 1700000000000;
    const spy = jest.spyOn(Date, 'now').mockReturnValue(fixedNow);

    cartService.addItem({ id: '1', name: 'Item 1', price: 100, quantity: 1 });
    const exactBoundaryDate = new Date(fixedNow).toISOString();

    cartService.applyDiscount({
      id: 'd1',
      type: 'coupon_expiration',
      amount: 25,
      expiresAt: exactBoundaryDate,
    });

    const summary = cartService.getSummary();
    expect(summary.discount).toBe(0);
    expect(summary.total).toBe(100);

    spy.mockRestore();
  });

  test('compounding percentage discounts work sequentially on remaining subtotal', () => {
    cartService.addItem({ id: '1', name: 'Item 1', price: 100, quantity: 1 });
    cartService.applyDiscount({ id: 'd1', type: 'percentage', percentage: 10 });
    cartService.applyDiscount({ id: 'd2', type: 'percentage', percentage: 20 });
    const summary = cartService.getSummary();
    expect(summary.subtotal).toBe(100);
    expect(summary.discount).toBe(28);
    expect(summary.total).toBe(72);
  });

  test('BulkDiscountStrategy uses remaining subtotal for calculation', () => {
    const bulkStrategy = new BulkDiscountStrategy();
    const items: CartItem[] = [{ id: '1', name: 'Item 1', price: 10, quantity: 5 }];
    const rule: DiscountRule = { type: 'bulk', minQuantity: 3, discountPercentage: 10 };
    const discount = bulkStrategy.calculateDiscount(40, items, rule);
    expect(discount).toBe(4);
  });

  test('Finding 11: updateQuantity ignores invalid quantity updates without removing items', () => {
    cartService.addItem({ id: '1', name: 'Item 1', price: 10, quantity: 2 });
    
    // Invalid updates should be ignored, quantity remains 2
    cartService.updateQuantity('1', 2.5);
    expect(cartService.getSummary().items[0].quantity).toBe(2);

    cartService.updateQuantity('1', NaN);
    expect(cartService.getSummary().items[0].quantity).toBe(2);

    cartService.updateQuantity('1', Infinity);
    expect(cartService.getSummary().items[0].quantity).toBe(2);

    cartService.updateQuantity('1', -5);
    expect(cartService.getSummary().items[0].quantity).toBe(2);

    // Explicit quantity = 0 removes item
    cartService.updateQuantity('1', 0);
    expect(cartService.getSummary().items.length).toBe(0);
  });

  test('Finding 9: BulkDiscountStrategy ignores invalid/unpriced items when counting quantities', () => {
    const bulkStrategy = new BulkDiscountStrategy();
    const items: any[] = [
      { id: '1', name: 'Valid Item', price: 10, quantity: 2 },
      { id: '2', name: 'Invalid Item NaN Price', price: NaN, quantity: 10 },
      { id: '3', name: 'Invalid Negative Price', price: -5, quantity: 10 },
    ];
    const rule: DiscountRule = { type: 'bulk', minQuantity: 5, discountPercentage: 10 };
    // Total valid quantity is only 2 (< minQuantity 5), so discount must be 0
    const discount = bulkStrategy.calculateDiscount(20, items, rule);
    expect(discount).toBe(0);
  });

  test('Finding 10: CartSummary.appliedDiscounts typed as (Discount | DiscountRule)[]', () => {
    const customRule: DiscountRule = { type: 'custom_type', value: 15, customProp: 'hello' } as any;
    cartService.applyDiscount(customRule);
    const summary = cartService.getSummary();
    expect(summary.appliedDiscounts.length).toBe(1);
    expect(summary.appliedDiscounts[0].type).toBe('custom_type');
  });

  test('auto-generates id for discount rules applied without an id', () => {
    cartService.applyDiscount({ type: 'percentage', percentage: 10 });
    const summary = cartService.getSummary();
    expect(summary.appliedDiscounts[0].id).toBeDefined();
    expect(typeof summary.appliedDiscounts[0].id).toBe('string');
  });

  test('deep-clones discounts and items to prevent external mutation', () => {
    const discount: DiscountRule = { id: 'd1', type: 'percentage', percentage: 10 };
    cartService.applyDiscount(discount);
    discount.percentage = 50;

    const summary = cartService.getSummary();
    expect(summary.appliedDiscounts[0].percentage).toBe(10);
  });

  test('falls back to value when specialized property is explicitly undefined', () => {
    cartService.addItem({ id: '1', name: 'Item 1', price: 100, quantity: 1 });
    cartService.applyDiscount({ id: 'd1', type: 'fixed', amount: undefined, value: 15 } as any);
    const summary = cartService.getSummary();
    expect(summary.discount).toBe(15);
  });
});
