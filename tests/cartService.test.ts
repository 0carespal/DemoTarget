import { ShoppingCart } from '../src/cart/cartService';

describe('ShoppingCart Unit Tests', () => {
  let cart: ShoppingCart;

  beforeEach(() => {
    cart = new ShoppingCart({ taxRate: 0.1 }); // 10% tax
  });

  it('should initialize empty cart', () => {
    const summary = cart.getSummary();
    expect(summary.subtotal).toBe(0);
    expect(summary.total).toBe(0);
    expect(summary.itemCount).toBe(0);
  });

  it('should add items and calculate subtotal correctly', () => {
    cart.addItem({ id: 'item-1', name: 'Book', price: 15, quantity: 2 });
    cart.addItem({ id: 'item-2', name: 'Pen', price: 2.5, quantity: 4 });

    const items = cart.getItems();
    expect(items).toHaveLength(2);

    const summary = cart.getSummary();
    expect(summary.subtotal).toBe(40); // (15*2) + (2.5*4) = 30 + 10 = 40
    expect(summary.taxAmount).toBe(4); // 10% of 40 = 4
    expect(summary.total).toBe(44);
    expect(summary.itemCount).toBe(6);
  });

  it('should accumulate quantities when adding existing item', () => {
    cart.addItem({ id: 'item-1', name: 'Book', price: 15, quantity: 1 });
    cart.addItem({ id: 'item-1', name: 'Book', price: 15, quantity: 2 });

    const items = cart.getItems();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });

  it('should apply discount code correctly', () => {
    cart.addItem({ id: 'item-1', name: 'Laptop', price: 1000, quantity: 1 });
    cart.applyDiscountCode('PROMO10', 10); // 10% off

    const summary = cart.getSummary();
    expect(summary.subtotal).toBe(1000);
    expect(summary.discountAmount).toBe(100);
    expect(summary.taxAmount).toBe(90); // 10% of (1000 - 100) = 90
    expect(summary.total).toBe(990);
  });

  it('should update item quantity or remove if set to 0', () => {
    cart.addItem({ id: 'item-1', name: 'Phone', price: 500, quantity: 2 });

    cart.updateQuantity('item-1', 5);
    expect(cart.getItems()[0].quantity).toBe(5);

    cart.updateQuantity('item-1', 0);
    expect(cart.getItems()).toHaveLength(0);
  });

  it('should throw error when adding invalid item', () => {
    expect(() => {
      cart.addItem({ id: '', name: 'Invalid', price: -10, quantity: 0 });
    }).toThrow();
  });
});
