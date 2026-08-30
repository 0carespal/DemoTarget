import { CartService } from '../src/cart/cartService';

describe('CartService', () => {
  let cartService: CartService;

  beforeEach(() => {
    cartService = new CartService();
  });

  describe('addItem', () => {
    it('should add an item to the cart', () => {
      const result = cartService.addItem({ id: 'item-1', name: 'Widget', price: 10, quantity: 2 });
      expect(result.success).toBe(true);
      expect(result.data?.itemCount).toBe(2);
      expect(result.data?.subtotal).toBe(20);
    });

    it('should update quantity if item already exists', () => {
      cartService.addItem({ id: 'item-1', name: 'Widget', price: 10, quantity: 2 });
      const result = cartService.addItem({ id: 'item-1', name: 'Widget', price: 10, quantity: 3 });
      expect(result.success).toBe(true);
      expect(result.data?.itemCount).toBe(5);
      expect(result.data?.subtotal).toBe(50);
    });

    it('should reject invalid items', () => {
      const result = cartService.addItem({ id: '', name: 'Invalid', price: 10, quantity: 1 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Item ID is required');
    });

    it('should reject negative prices', () => {
      const result = cartService.addItem({ id: 'item-1', name: 'Free', price: -5, quantity: 1 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('price cannot be negative');
    });
  });

  describe('applyDiscount', () => {
    it('should apply a percentage discount', () => {
      cartService.addItem({ id: 'item-1', name: 'Widget', price: 100, quantity: 1 });
      const result = cartService.applyDiscount({
        code: 'SAVE10',
        type: 'percentage',
        value: 10,
      });

      expect(result.success).toBe(true);
      expect(result.data?.subtotal).toBe(100);
      expect(result.data?.totalSavings).toBe(10);
      expect(result.data?.finalTotal).toBe(90);
    });

    it('should compound multiple percentage discounts sequentially', () => {
      cartService.addItem({ id: 'item-1', name: 'Widget', price: 100, quantity: 1 });
      cartService.applyDiscount({
        code: 'HALF1',
        type: 'percentage',
        value: 50,
      });
      const result = cartService.applyDiscount({
        code: 'HALF2',
        type: 'percentage',
        value: 50,
      });

      expect(result.success).toBe(true);
      expect(result.data?.subtotal).toBe(100);
      expect(result.data?.totalSavings).toBe(75);
      expect(result.data?.finalTotal).toBe(25);
    });

    it('should compound three percentage discounts sequentially', () => {
      cartService.addItem({ id: 'item-1', name: 'Widget', price: 100, quantity: 1 });
      cartService.applyDiscount({ code: 'DISC20', type: 'percentage', value: 20 }); // $100 -> $80
      cartService.applyDiscount({ code: 'DISC10', type: 'percentage', value: 10 }); // $80 -> $72
      const result = cartService.applyDiscount({ code: 'DISC50', type: 'percentage', value: 50 }); // $72 -> $36

      expect(result.success).toBe(true);
      expect(result.data?.subtotal).toBe(100);
      expect(result.data?.totalSavings).toBe(64);
      expect(result.data?.finalTotal).toBe(36);
    });

    it('should ensure total never drops below $0.00', () => {
      cartService.addItem({ id: 'item-1', name: 'Widget', price: 100, quantity: 1 });
      cartService.applyDiscount({ code: 'FLAT150', type: 'fixed', value: 150 });
      const summary = cartService.getSummary();

      expect(summary.totalSavings).toBe(100);
      expect(summary.finalTotal).toBe(0);
    });

    it('should reject duplicate discount codes', () => {
      cartService.addItem({ id: 'item-1', name: 'Widget', price: 100, quantity: 1 });
      cartService.applyDiscount({ code: 'SAVE10', type: 'percentage', value: 10 });
      const result = cartService.applyDiscount({
        code: 'SAVE10',
        type: 'percentage',
        value: 10,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('already been applied');
    });

    it('should reject invalid discount values', () => {
      const result = cartService.applyDiscount({
        code: 'INVALID',
        type: 'percentage',
        value: 150,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot exceed 100%');
    });
  });

  describe('clear', () => {
    it('should reset cart completely', () => {
      cartService.addItem({ id: 'item-1', name: 'Widget', price: 10, quantity: 1 });
      cartService.applyDiscount({ code: 'SAVE10', type: 'percentage', value: 10 });
      cartService.clear();

      const summary = cartService.getSummary();
      expect(summary.items).toHaveLength(0);
      expect(summary.itemCount).toBe(0);
      expect(summary.subtotal).toBe(0);
      expect(summary.appliedDiscounts).toHaveLength(0);
    });
  });
});
