import {
  calculateSubtotal,
  applyDiscounts,
  calculateTotal,
  ShoppingCart,
} from '../src/cart/cartService';
import { CartItem, Discount } from '../src/cart/types';

describe('cartService Unit Tests', () => {
  describe('calculateSubtotal', () => {
    it('should return 0 for an empty items array', () => {
      expect(calculateSubtotal([])).toBe(0);
    });

    it('should correctly calculate subtotal for multiple valid items', () => {
      const items: CartItem[] = [
        { id: '1', name: 'Item A', price: 10, quantity: 2 },
        { id: '2', name: 'Item B', price: 25.5, quantity: 1 },
      ];
      expect(calculateSubtotal(items)).toBe(45.5);
    });

    it('should throw an error if items is not an array', () => {
      expect(() => calculateSubtotal(null as unknown as CartItem[])).toThrow('Items must be an array.');
    });

    it('should throw an error for negative item price or quantity', () => {
      const invalidPriceItems: CartItem[] = [
        { id: '1', name: 'Invalid', price: -5, quantity: 1 },
      ];
      expect(() => calculateSubtotal(invalidPriceItems)).toThrow();

      const invalidQtyItems: CartItem[] = [
        { id: '1', name: 'Invalid', price: 10, quantity: -2 },
      ];
      expect(() => calculateSubtotal(invalidQtyItems)).toThrow();
    });
  });

  describe('applyDiscounts', () => {
    it('should return the subtotal if no discounts are applied', () => {
      expect(applyDiscounts(100, [])).toBe(100);
    });

    it('should apply a single percentage discount correctly', () => {
      const discounts: Discount[] = [{ type: 'percentage', value: 20 }];
      expect(applyDiscounts(100, discounts)).toBe(80);
    });

    it('should apply a single fixed discount correctly', () => {
      const discounts: Discount[] = [{ type: 'fixed', value: 15 }];
      expect(applyDiscounts(100, discounts)).toBe(85);
    });

    it('should compound multiple percentage discounts correctly', () => {
      const discounts: Discount[] = [
        { type: 'percentage', value: 50 },
        { type: 'percentage', value: 50 },
      ];
      // 100 with 50% discount = 50, then another 50% discount on 50 = 25
      expect(applyDiscounts(100, discounts)).toBe(25);
    });

    it('should ensure cart totals never become negative', () => {
      const discounts: Discount[] = [{ type: 'fixed', value: 150 }];
      expect(applyDiscounts(100, discounts)).toBe(0);
    });

    it('should throw an error for negative subtotal or non-array discounts', () => {
      expect(() => applyDiscounts(-10, [])).toThrow();
      expect(() => applyDiscounts(100, null as unknown as Discount[])).toThrow();
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total from items and compounded discounts', () => {
      const items: CartItem[] = [
        { id: '1', name: 'Product A', price: 50, quantity: 2 }, // subtotal = 100
      ];
      const discounts: Discount[] = [
        { type: 'percentage', value: 50 },
        { type: 'percentage', value: 50 },
      ];
      expect(calculateTotal(items, discounts)).toBe(25);
    });
  });

  describe('ShoppingCart Class', () => {
    let cart: ShoppingCart;

    beforeEach(() => {
      cart = new ShoppingCart({ taxRate: 0.1 });
    });

    it('should initialize an empty cart with summary 0', () => {
      const summary = cart.getSummary();
      expect(summary.subtotal).toBe(0);
      expect(summary.total).toBe(0);
      expect(summary.itemCount).toBe(0);
    });

    it('should add items and calculate subtotal correctly', () => {
      cart.addItem({ id: 'item-1', name: 'Book', price: 15, quantity: 2 });
      cart.addItem({ id: 'item-2', name: 'Pen', price: 2.5, quantity: 4 });

      expect(cart.getItems()).toHaveLength(2);
      const summary = cart.getSummary();
      expect(summary.subtotal).toBe(40);
      expect(summary.total).toBe(44); // 40 + 10% tax
    });

    it('should update item quantity or remove item if set to 0', () => {
      cart.addItem({ id: 'item-1', name: 'Phone', price: 500, quantity: 2 });
      cart.updateQuantity('item-1', 5);
      expect(cart.getItems()[0].quantity).toBe(5);

      cart.updateQuantity('item-1', 0);
      expect(cart.getItems()).toHaveLength(0);
    });
  });
});
